import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiRequest, DISPUTE_STATUS, MODAL_CATEGORY, RENTAL_STATUS, ROLE, TOAST_TYPE} from "../util/Util.js";
import {
    fetchRequestsByClient, fetchRentalsByRequestIds, fetchListingsByIds,
    fetchDisputesByRentalIds, fetchRentalById, deleteRequest, fetchFromTable
} from "../../services/service.js";
import ClientDashboardPresenter from "./ClientDashboardPresenter.jsx";
import {useClientDashboardDataHook} from "./useClientDashboardDataHook.jsx";
import {useAuth, useToast} from "../AppContext.jsx";
import Loader from "../common/Loader.jsx";

export default function ClientDashboardContainer() {
    const navigate = useNavigate();
    const {authenticatedUser} = useAuth();
    const {addToast} = useToast();
    const userId = authenticatedUser.id;

    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [requests, setRequests] = useState([]);
    const [clientRentals, setClientRentals] = useState([]);
    const [purchases, setPurchases] = useState([]);

    const [modalPayload, setModalPayload] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const category = modalPayload?.category;

    // --- Data Fetching (useEffect) ---
    useEffect(() => {
        const fetchClientData = async () => {
            setLoading(true);

            // 1. Fetch Requests (Primary data source for Client)
            const {data: requestData, error: reqError} = await fetchRequestsByClient(userId);

            if (reqError) console.error("Error fetching requests:", reqError);
            const fetchedRequests = requestData || [];
            setRequests(fetchedRequests);

            const requestIds = fetchedRequests.map(req => req.id);
            const listingIds = fetchedRequests.map(req => req.listing_id);

            // 2. Fetch Rentals associated with those Requests
            const {data: rentalData, error: rentalError} = await fetchRentalsByRequestIds(requestIds);

            if (rentalError) console.error("Error fetching rentals:", rentalError);
            const fetchedRentals = rentalData || [];
            setClientRentals(fetchedRentals);

            // 3. Fetch Listings needed for display titles
            const {data: listingData, error: listingError} = await fetchListingsByIds(listingIds);

            if (listingError) console.error("Error fetching listings:", listingError);
            setListings(listingData || []);

            // 4. Fetch Disputes linked to the retrieved Rentals
            const rentalIds = fetchedRentals.map(rental => rental.id);
            const {data: disputeData, error: disputeError} = await fetchDisputesByRentalIds(rentalIds);

            if (disputeError) console.error("Error fetching disputes:", disputeError);
            setDisputes(disputeData || []);

            // 5. Fetch Purchases (sale transactions where user is the buyer)
            const {data: txData, error: txError} = await fetchFromTable('transactions', {payer_id: userId, type: 'SALE'});

            if (txError) console.error("Error fetching purchases:", txError);
            if (txData && txData.length > 0) {
                // Get the request snapshots for each purchase
                const purchaseRequestIds = txData.map(tx => tx.request_id);
                const {data: purchaseRequests} = await fetchFromTable('requests', {});
                const matchingRequests = (purchaseRequests || []).filter(r => purchaseRequestIds.includes(r.id));

                const purchasesWithSnapshots = txData.map(tx => {
                    const req = matchingRequests.find(r => r.id === tx.request_id);
                    let snapshot = req?.listing_snapshot;
                    if (typeof snapshot === 'string') {
                        try { snapshot = JSON.parse(snapshot); } catch (e) { snapshot = null; }
                    }
                    return {
                        ...tx,
                        listing_snapshot: snapshot,
                        date: req?.date || new Date(tx.created_at).toLocaleDateString()
                    };
                });

                setPurchases(purchasesWithSnapshots);
            }

            setLoading(false);
        };

        fetchClientData();

    }, [userId]);

    // --- Data Filtering (useMemo) ---
    const {activeRentals, disputedRentals, pastRentals} = useClientDashboardDataHook(clientRentals, disputes);

    // --- Handlers ---
    const handleReturn = async function (rental, event) {
        event.preventDefault();

        const {data: newDispute, error} = await apiRequest('/api/returnItemCreateDispute', {
            method: 'POST',
            body: {
                rentalId: rental.id,
                disputeStatus: DISPUTE_STATUS.PENDING_DEPOSIT_RETURN,
                rentalStatus: RENTAL_STATUS.RETURNED
            }
        });

        if (error) {
            addToast(TOAST_TYPE.ERROR, `Error Returning Item: ${error.message}`);
            return;
        }

        const {data: updatedRental, error: rentalError} = await fetchRentalById(rental.id);

        if (rentalError) {
            addToast(TOAST_TYPE.ERROR, `Error retrieving updated rental: ${rentalError.message}`);
        }

        // C. Update local state
        setClientRentals(prevRentals =>
            prevRentals.map(r => r.id === rental.id ? updatedRental : r)
        );
        setDisputes(prevDisputes => [...prevDisputes, newDispute]);

        navigate('/disputes');
    }

    const handleViewDispute = function () {
        navigate(`/disputes`);
    }

    const cancelRequest = async (request) => {
        const {error} = await deleteRequest(request.id);

        if (error) {
            addToast(TOAST_TYPE.ERROR, `Error cancelling request: ${request.id}: ${error.message}`);
            return;
        }

        const listing = listings.find(l => l.id === request.listing_id);

        addToast(TOAST_TYPE.INFO, `You have cancelled your request to borrow: ${listing.title}`);

        setRequests(prevRequests =>
            prevRequests.filter(req => req.id !== request.id)
        );
    };

    const openItemDetailsModal = (item) => {
        setModalPayload({category: MODAL_CATEGORY.ITEM, data: {item, role: ROLE.CLIENT}});
        setIsModalOpen(true);
    }

    const openMerchantDetailsModal = (event, userId) => {
        event.stopPropagation();

        setModalPayload({category: MODAL_CATEGORY.MERCHANT, data: {userId}});
        setIsModalOpen(true);
    }

    const closeAllModals = () => {
        setIsModalOpen(false);
        setModalPayload(null);
    }

    // --- MODAL CONFIGURATION SETUP ---
    const MODAL_REGISTRY = {
        [MODAL_CATEGORY.ITEM]: {
            title: modalPayload?.data?.item ? `Details: ${modalPayload?.data?.item.title}` : "Item Details",
            maxWidth: "max-w-xl",
            props: {
                item: modalPayload?.data?.item,
                role: modalPayload?.data?.role
            }
        },
        [MODAL_CATEGORY.MERCHANT]: {
            title: "Merchant Details",
            maxWidth: "max-w-xl",
            props: {
                userId: modalPayload?.data?.userId,
            }
        }
    };

    const currentModalConfig = MODAL_REGISTRY[category] || {};

    const modalProps = {
        title: currentModalConfig.title,
        maxWidth: currentModalConfig.maxWidth,
        ...currentModalConfig.props
    };

    const itemDetailsModalActive = currentModalConfig.title && isModalOpen;

    if (loading) {
        return <Loader show={loading} message={'Loading Client Dashboard'}/>
    }

    return (
        <ClientDashboardPresenter
            itemDetailsModalActive={itemDetailsModalActive}
            isModalOpen={isModalOpen}
            closeAllModals={closeAllModals}
            category={category}
            modalProps={modalProps}

            activeRentals={activeRentals}
            disputedRentals={disputedRentals}
            pastRentals={pastRentals}
            requests={requests}
            listings={listings}
            disputes={disputes}
            purchases={purchases}

            openItemDetailsModal={openItemDetailsModal}
            openMerchantDetailsModal={openMerchantDetailsModal}
            handleReturn={handleReturn}
            handleViewDispute={handleViewDispute}
            cancelRequest={cancelRequest}
        />
    );
}
