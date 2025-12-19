import React, {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {supabase} from "../../server/supabaseClient.js";
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
import LenderDashboardPresenter from "./LenderDashboardPresenter.jsx";
import {useAuth, useToast} from "../AppContext.jsx";
import Loader from "../common/Loader.jsx";

export default function LenderDashboardContainer() {
    const {authenticatedUser} = useAuth();
    const {addToast} = useToast();
    const navigate = useNavigate();

    const userId = authenticatedUser.id;

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPayload, setModalPayload] = useState(null);
    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [lenderRentals, setLenderRentals] = useState([]);
    const [disputes, setDisputes] = useState([]);

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

    const openBorrowerModal = (event, userId) => {
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
        const fetchLenderData = async () => {
            setLoading(true);

            const fetchTable = async (table, filters = {}, setState) => {
                let query = supabase.from(table).select('*');
                Object.entries(filters).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });

                const { data, error } = await query;

                if (error) {
                    addToast(TOAST_TYPE.ERROR, `Error fetching ${table}: ${error.message}`);

                } else if (data) {
                    setState(data);
                }

                return data;
            };

            const [fetchedListings, fetchedRequests] = await Promise.all([
                fetchTable('listings_with_availability', {'owner_id': userId}, setListings),
                fetchTable('requests', {'lender_id': userId}, setRequests)
            ]);

            const requestIds = fetchedRequests ? fetchedRequests.map(req => req.id) : [];

            const {data: rentalData, error: rentalError} = await supabase
                .from('rentals')
                .select('*, request_id')
                .in('request_id', requestIds);

            if (rentalError) {
                addToast(TOAST_TYPE.ERROR, `Error fetching rentals: ${rentalError.message}`);
            }

            const lenderRentals = rentalData || [];
            setLenderRentals(lenderRentals);

            const rentalIds = lenderRentals.map(rental => rental.id);

            const {data: disputeData, error: disputeError} = await supabase
                .from('disputes')
                .select('*')
                .in('rental_id', rentalIds);

            if (disputeError) {
                addToast(TOAST_TYPE.ERROR, `Error fetching disputes: ${disputeError.message}`);
            }

            setDisputes(disputeData || []);
            setLoading(false);
        };

        fetchLenderData();

    }, [userId]);

    // --- DATA FILTERING (Moved from component body) ---
    const activeRentals = lenderRentals.filter(rental => rental.status === RENTAL_STATUS.ACTIVE);
    const pendingRentalListings = listings.filter(item => item.available && item.status === LISTING_STATUS.ACTIVE);
    const disputedRentals = lenderRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.RETURNED) return false;

        const dispute = disputes.find(d => d.rental_id === rental.id);

        return dispute && dispute.status !== DISPUTE_STATUS.COMPLETED;
    });
    const pastRentals = lenderRentals.filter(rental => {
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
                setLenderRentals: setLenderRentals,
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
            title: "Borrower Details",
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
        return <Loader show={loading} message={'Loading Lender Dashboard'}/>
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
            disputes={disputes}
            pastRentals={pastRentals}
            requests={requests}
            listings={listings}

            // Action Handlers
            openAcceptModal={openAcceptModal}
            openItemDetailsModal={openItemDetailsModal}
            declineRequest={declineRequest}
            editItem={editItem}
            handleViewDisputes={handleViewDisputes}
            openBorrowerModal={openBorrowerModal}
        />
    );
}