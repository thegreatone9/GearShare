import React, {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {
    fetchRentalsByRequestIds, fetchDisputesByRentalIds, fetchFromTable
} from "../../services/service.js";
import {
    apiRequest,
    DISPUTE_STATUS,
    LISTING_STATUS,
    MODAL_CATEGORY,
    RENTAL_STATUS,
    REQUEST_STATUS,
    ROLE,
    TOAST_TYPE
} from "../util/Util.js";
import MerchantDashboardPresenter from "./MerchantDashboardPresenter.jsx";
import {useAuth, useToast} from "../AppContext.jsx";
import Loader from "../common/Loader.jsx";

export default function MerchantDashboardContainer() {
    const {authenticatedUser} = useAuth();
    const {addToast} = useToast();
    const navigate = useNavigate();

    const userId = authenticatedUser.id;

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPayload, setModalPayload] = useState(null);
    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [merchantRentals, setMerchantRentals] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [sales, setSales] = useState([]);

    const category = modalPayload?.category;

    // --- ACTION HANDLERS ---
    const editItem = function (itemId, itemStatus) {
        navigate(`/item/${itemId}?status=${itemStatus}&role=${ROLE.LENDER}`);
    }

    const handleViewDisputes = function () {
        navigate('/disputes');
    }

    const openAcceptModal = (request) => {
        setModalPayload({category: MODAL_CATEGORY.ACCEPT_RENTAL_REQUEST, data: {request}});
        setIsModalOpen(true);
    };

    const openClientModal = (event, userId) => {
        event.preventDefault();
        event.stopPropagation();

        setModalPayload({category: MODAL_CATEGORY.BORROWER, data: {userId}});
        setIsModalOpen(true);
    };

    const openItemDetailsModal = (item) => {
        setModalPayload({category: MODAL_CATEGORY.ITEM, data: {item, role: ROLE.LENDER}});
        setIsModalOpen(true);
    }

    const closeAllModals = () => {
        setIsModalOpen(false);
        setModalPayload(null);
    }

    const declineRequest = async (request) => {
        const {error} = await apiRequest('/api/declineRentalRequest', {
            method: 'POST',
            params: {
                requestId: request.id,
                newStatus: REQUEST_STATUS.DECLINED
            }
        });

        if (error) {
            addToast(TOAST_TYPE.ERROR, `Error declining request: ${request.id}: ${error}`);
            return;
        }

        addToast(TOAST_TYPE.INFO, `You have declined a request to borrow: ${listings.find(item => item.id === request.listing_id).title}`);

        setRequests(prevRequests =>
            prevRequests.filter(req => req.id !== request.id)
        );
    };

    // --- INITIAL DATA FETCHING ---
    useEffect(() => {
        const fetchMerchantData = async () => {
            setLoading(true);

            const fetchTable = async (table, filters = {}, setState) => {
                const { data, error } = await fetchFromTable(table, filters);

                if (error) {
                    addToast(TOAST_TYPE.ERROR, `Error fetching ${table}: ${error.message}`);

                } else if (data) {
                    setState(data);
                }

                return data;
            };

            const fetchListingsFromApi = async () => {
                const { data, error } = await apiRequest('/api/listingsWithAvailability', {
                    params: {
                        ownerId: userId,
                        status: LISTING_STATUS.ACTIVE,
                        available: true
                    }
                });

                if (error) {
                    addToast(TOAST_TYPE.ERROR, `Error fetching listings: ${error}`);
                    return null;
                }

                setListings(data);
                return data;
            };

            const [fetchedListings, fetchedRequests] = await Promise.all([
                fetchListingsFromApi(),
                fetchTable('requests', {'lender_id': userId}, setRequests)
            ]);

            const requestIds = fetchedRequests ? fetchedRequests.map(req => req.id) : [];

            const {data: rentalData, error: rentalError} = await fetchRentalsByRequestIds(requestIds);

            if (rentalError) {
                addToast(TOAST_TYPE.ERROR, `Error fetching rentals: ${rentalError.message || rentalError}`);
            }

            const merchantRentalsData = rentalData || [];
            setMerchantRentals(merchantRentalsData);

            const rentalIds = merchantRentalsData.map(rental => rental.id);

            const {data: disputeData, error: disputeError} = await fetchDisputesByRentalIds(rentalIds);

            if (disputeError) {
                addToast(TOAST_TYPE.ERROR, `Error fetching disputes: ${disputeError.message || disputeError}`);
            }

            setDisputes(disputeData || []);

            // Fetch completed sales
            const {data: txData, error: txError} = await fetchFromTable('transactions', {payee_id: userId, type: 'SALE'});
            if (txError) console.error("Error fetching sales:", txError);
            if (txData && txData.length > 0) {
                const saleRequestIds = txData.map(tx => tx.request_id);
                const {data: saleRequests} = await fetchFromTable('requests', {});
                const matchingRequests = (saleRequests || []).filter(r => saleRequestIds.includes(r.id));

                const salesWithSnapshots = txData.map(tx => {
                    const req = matchingRequests.find(r => r.id === tx.request_id);
                    let snapshot = req?.listing_snapshot;
                    if (typeof snapshot === 'string') {
                        try { snapshot = JSON.parse(snapshot); } catch (e) { snapshot = null; }
                    }
                    return {
                        ...tx,
                        listing_snapshot: snapshot,
                        buyer_id: tx.payer_id,
                        date: req?.date || new Date(tx.created_at).toLocaleDateString()
                    };
                });
                setSales(salesWithSnapshots);
            }

            setLoading(false);
        };

        fetchMerchantData();

    }, [userId]);

    // --- DATA FILTERING (Moved from component body) ---
    const activeRentals = merchantRentals.filter(rental => rental.status === RENTAL_STATUS.ACTIVE);
    const pendingRentalListings = listings.filter(item => item.status === LISTING_STATUS.ACTIVE);
    const disputedRentals = merchantRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.RETURNED) return false;

        const dispute = disputes.find(d => d.rental_id === rental.id);

        return dispute && dispute.status !== DISPUTE_STATUS.COMPLETED;
    });
    const pastRentals = merchantRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.COMPLETED) return false;

        const dispute = disputes.find(d => d.rental_id === rental.id);

        return !dispute || dispute.status === DISPUTE_STATUS.COMPLETED;
    });

    // --- MODAL CONFIGURATION SETUP ---
    const MODAL_REGISTRY = {
        [MODAL_CATEGORY.ACCEPT_RENTAL_REQUEST]: {
            title: "Review Rental Confirmation",
            maxWidth: "max-w-lg",
            props: {
                request: modalPayload?.data?.request,
                setRequests: setRequests,
                setMerchantRentals: setMerchantRentals,
                closeAllModals: closeAllModals
            }
        },
        [MODAL_CATEGORY.ITEM]: {
            title: modalPayload?.data?.item ? `Details: ${modalPayload?.data?.item.title}` : "Item Details",
            maxWidth: "max-w-xl",
            props: {
                item: modalPayload?.data?.item,
                role: modalPayload?.data?.role
            }
        },
        [MODAL_CATEGORY.BORROWER]: {
            title: "Client Details",
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
        return <Loader show={loading} message={'Loading Merchant Dashboard'}/>
    }

    return (
        <MerchantDashboardPresenter
            // Modal Props
            itemDetailsModalActive={itemDetailsModalActive}
            isModalOpen={isModalOpen}
            closeAllModals={closeAllModals}
            category={category}
            modalProps={modalProps}

            // Data Lists
            activeRentals={activeRentals}
            pendingRentalListings={pendingRentalListings}
            disputedRentals={disputedRentals}
            disputes={disputes}
            pastRentals={pastRentals}
            requests={requests}
            listings={listings}
            sales={sales}

            // Action Handlers
            openAcceptModal={openAcceptModal}
            openItemDetailsModal={openItemDetailsModal}
            declineRequest={declineRequest}
            editItem={editItem}
            handleViewDisputes={handleViewDisputes}
            openClientModal={openClientModal}
        />
    );
}
