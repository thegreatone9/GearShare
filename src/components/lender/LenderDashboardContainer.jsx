import React, {useContext, useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {supabase} from "../../server/supabaseClient.js";
import {AuthContext} from "../../App.jsx";
import {DISPUTE_STATUS, RENTAL_STATUS, ROLE} from "../util/Util.js";
import LenderDashboardPresenter from "./LenderDashboardPresenter.jsx"; // Importing the new Presenter Component

export default function LenderDashboardContainer() {
    const { authenticatedUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const userId = authenticatedUser.id;

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPayload, setModalPayload] = useState(null);
    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [lenderRentals, setLenderRentals] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    // --- ACTION HANDLERS ---
    const editItem = function (itemId, itemStatus) {
        navigate(`/item/${itemId}?status=${itemStatus}&role=${ROLE.LENDER}`);
    }

    const handleViewDisputes = function() {
        navigate('/disputes');
    }

    const openAcceptModal = (request) => {
        setModalPayload({ category: 'acceptRentalRequest', data: request });
        setIsModalOpen(true);
    };

    const openItemDetailsModal = (item) => {
        setModalPayload({ category: 'item', data: item });
        setIsModalOpen(true);
    }

    const closeAllModals = () => {
        setIsModalOpen(false);
        setModalPayload(null);
    }

    const declineRequest = async (request) => {
        const { error } = await supabase
            .from('requests')
            .delete()
            .eq('id', request.id);

        if (error) {
            console.error(`Error declining request ${request.id}:`, error);
            return;
        }

        setRequests(prevRequests =>
            prevRequests.filter(req => req.id !== request.id)
        );
    };


    // --- INITIAL DATA FETCHING ---
    useEffect(() => {
        const fetchLenderData = async () => {
            setLoading(true);

            const fetchTable = async (table, fkColumn, setState) => {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq(fkColumn, userId);

                if (error) console.error(`Error fetching ${table}:`, error);
                if (data) setState(data);

                return data;
            };

            const [fetchedListings, fetchedRequests] = await Promise.all([
                fetchTable('listings', 'owner_id', setListings),
                fetchTable('requests', 'lender_id', setRequests),
            ]);

            const requestIds = fetchedRequests ? fetchedRequests.map(req => req.id) : [];

            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select('*, request_id')
                .in('request_id', requestIds);

            if (rentalError) console.error("Error fetching rentals:", rentalError);

            const lenderRentals = rentalData || [];
            setLenderRentals(lenderRentals);

            const rentalIds = lenderRentals.map(rental => rental.id);

            const { data: disputeData, error: disputeError } = await supabase
                .from('disputes')
                .select('*')
                .in('rental_id', rentalIds);

            if (disputeError) console.error("Error fetching disputes:", disputeError);

            setDisputes(disputeData || []);
            setLoading(false);
        };

        fetchLenderData();

    }, [userId]);

    // --- DYNAMIC MODAL DATA FETCHING EFFECT ---
    useEffect(() => {
        if (!modalPayload || !modalPayload.data) {
            return;
        }

        const { category, data } = modalPayload;

        const fetchModalData = async () => {
            setModalLoading(true);

            let listingId = null;
            let borrowerId = null;
            let itemToUse = data.item || data;
            let borrowerToUse = null;

            switch (category) {
                case 'acceptRentalRequest':
                    listingId = data.listing_id;
                    borrowerId = data.borrower_id;
                    break;
                case 'item':
                    itemToUse = data;
                    listingId = data.id;
                    break;
                default:
                    setModalLoading(false);
                    return;
            }

            if (listingId && !itemToUse.title) {
                const { data: itemData, error: itemError } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', listingId)
                    .single();
                if (itemError) console.error("Error fetching item:", itemError);
                itemToUse = itemData;
            }

            if (borrowerId) {
                const { data: borrowerData, error: borrowerError } = await supabase
                    .from('accounts')
                    .select('name, email')
                    .eq('id', borrowerId)
                    .single();

                if (borrowerError) console.error("Error fetching borrower:", borrowerError);
                borrowerToUse = borrowerData;
            }

            setModalPayload(prev => ({
                ...prev,
                data: {
                    ...prev.data,
                    item: itemToUse,
                    borrower: borrowerToUse
                }
            }));

            setModalLoading(false);
        };

        fetchModalData();

    }, [modalPayload, listings]);

    // --- DATA FILTERING (Moved from component body) ---
    const activeRentals = lenderRentals.filter(rental => rental.status === RENTAL_STATUS.ACTIVE);
    const pendingRentalListings = listings.filter(item => !activeRentals.map(aR => aR.listing_id).includes(item.id));
    const disputedRentals = lenderRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.COMPLETED) return false;

        const dispute = disputes.find(d => d.rental_id === rental.id);
        return dispute && dispute.status !== DISPUTE_STATUS.COMPLETED;
    });
    const pastRentals = lenderRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.COMPLETED) return false;

        const dispute = disputes.find(d => d.rental_id === rental.id);
        return !dispute || dispute.status === DISPUTE_STATUS.COMPLETED;
    });

    // --- MODAL CONFIGURATION SETUP ---
    const category = modalPayload?.category;
    const itemData = modalPayload?.data?.item || (category === 'item' ? modalPayload.data : null);
    const borrowerData = modalPayload?.data?.borrower || null;
    const requestData = category === 'acceptRentalRequest' ? modalPayload.data : null;

    const MODAL_REGISTRY = {
        acceptRentalRequest: {
            title: "Review Rental Confirmation",
            maxWidth: "max-w-lg",
            props: {
                request: requestData,
                item: itemData,
                borrower: borrowerData,
                setRequests: setRequests,
                setLenderRentals: setLenderRentals,
                closeAllModals: closeAllModals
            }
        },
        item: {
            title: itemData ? `Details: ${itemData.title}` : "Item Details",
            maxWidth: "max-w-xl",
            props: {
                item: itemData,
            }
        }
    };

    const currentModalConfig = MODAL_REGISTRY[category] || {};

    const modalProps = {
        modalLoading: modalLoading,
        title: currentModalConfig.title,
        maxWidth: currentModalConfig.maxWidth,
        ...currentModalConfig.props
    };

    const itemDetailsModalActive = currentModalConfig.title && isModalOpen;

    if (loading) {
        return <div className="p-8 text-center text-indigo-600">Loading Lender Dashboard...</div>;
    }

    return (
        <LenderDashboardPresenter
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
            pastRentals={pastRentals}
            requests={requests}
            listings={listings}

            // Action Handlers
            openAcceptModal={openAcceptModal}
            openItemDetailsModal={openItemDetailsModal}
            declineRequest={declineRequest}
            editItem={editItem}
            handleViewDisputes={handleViewDisputes}
        />
    );
}