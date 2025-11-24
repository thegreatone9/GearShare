import React, {useContext, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {DISPUTE_STATUS, MODAL_CATEGORY, RENTAL_STATUS} from "../util/Util.js";
import {supabase} from "../../server/supabaseClient.js";
import {AuthContext} from "../../App.jsx";
import BorrowerDashboardPresenter from "./BorrowerDashboardPresenter.jsx";
import {useBorrowerDashboardDataHook} from "./useBorrowerDashboardDataHook.jsx";

export default function BorrowerDashboardContainer() {
    const navigate = useNavigate();
    const { authenticatedUser } = useContext(AuthContext);
    const userId = authenticatedUser.id;

    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [requests, setRequests] = useState([]);
    const [borrowerRentals, setBorrowerRentals] = useState([]);

    const [modalPayload, setModalPayload] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const category = modalPayload?.category;

    // --- Data Fetching (useEffect) ---
    useEffect(() => {
        const fetchBorrowerData = async () => {
            setLoading(true);

            // 1. Fetch Requests (Primary data source for Borrower)
            const { data: requestData, error: reqError } = await supabase
                .from('requests')
                .select('*')
                .eq('borrower_id', userId);

            if (reqError) console.error("Error fetching requests:", reqError);
            const fetchedRequests = requestData || [];
            setRequests(fetchedRequests);

            const requestIds = fetchedRequests.map(req => req.id);
            const listingIds = fetchedRequests.map(req => req.listing_id);

            // 2. Fetch Rentals associated with those Requests
            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select('*, request_id')
                .in('request_id', requestIds);

            if (rentalError) console.error("Error fetching rentals:", rentalError);
            const fetchedRentals = rentalData || [];
            setBorrowerRentals(fetchedRentals);

            // 3. Fetch Listings needed for display titles
            const { data: listingData, error: listingError } = await supabase
                .from('listings')
                .select('*')
                .in('id', listingIds);

            if (listingError) console.error("Error fetching listings:", listingError);
            setListings(listingData || []);

            // 4. Fetch Disputes linked to the retrieved Rentals
            const rentalIds = fetchedRentals.map(rental => rental.id);
            const { data: disputeData, error: disputeError } = await supabase
                .from('disputes')
                .select('*')
                .in('rental_id', rentalIds);

            if (disputeError) console.error("Error fetching disputes:", disputeError);
            setDisputes(disputeData || []);

            setLoading(false);
        };

        fetchBorrowerData();

    }, [userId]);

    // --- Data Filtering (useMemo) ---
    const { activeRentals, disputedRentals, pastRentals } = useBorrowerDashboardDataHook(borrowerRentals, disputes);

    // --- Handlers ---
    const handleReturn = async function (rental, event) {
        event.preventDefault();

        const returnDate = new Date().toISOString();

        const newDisputeData = {
            rental_id: rental.id,
            start_date: returnDate,
            status: DISPUTE_STATUS.PENDING_DEPOSIT_RETURN
        };

        // A. INSERT the new dispute record first
        const {data: disputeResult, error: disputeError} = await supabase
            .from('disputes')
            .insert([newDisputeData])
            .select()
            .single();

        if (disputeError) {
            console.error("Error creating dispute record:", disputeError);
            return;
        }

        const updatedRentalData = {
            return_date: returnDate,
            status: RENTAL_STATUS.COMPLETED,
            dispute_id: disputeResult.id
        };

        // B. Update the rental status
        const {data: rentalResult, error: rentalError} = await supabase
            .from('rentals')
            .update(updatedRentalData)
            .eq('id', rental.id)
            .select()
            .single();

        if (rentalError) {
            console.error("Error updating rental status:", rentalError);
            return;
        }

        // C. Update local state
        setBorrowerRentals(prevRentals =>
            prevRentals.map(r => r.id === rental.id ? rentalResult : r)
        );
        setDisputes(prevDisputes => [...prevDisputes, disputeResult]);

        navigate('/disputes');
    }

    const handleViewDispute = function () {
        navigate(`/disputes`);
    }

    const cancelRequest = async (request) => {
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

    const openItemDetailsModal = (item) => {
        setModalPayload({ category: MODAL_CATEGORY.ITEM, data: {item} });
        setIsModalOpen(true);
    }

    const openLenderDetailsModal = (event, userId) => {
        event.stopPropagation();

        setModalPayload({ category: MODAL_CATEGORY.LENDER, data: {userId} });
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
                userId: modalPayload?.data?.lenderId
            }
        },
        [MODAL_CATEGORY.LENDER]: {
            title: "Lender Details",
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
        return <div className="p-8 text-center text-indigo-600">Loading Borrower Dashboard...</div>;
    }

    return (
        <BorrowerDashboardPresenter
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

            openItemDetailsModal={openItemDetailsModal}
            openLenderDetailsModal={openLenderDetailsModal}
            handleReturn={handleReturn}
            handleViewDispute={handleViewDispute}
            cancelRequest={cancelRequest}
        />
    );
}