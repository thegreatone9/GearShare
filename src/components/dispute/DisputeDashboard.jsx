import {Album, CheckCheck, ClockAlert, Handshake, Landmark, Shield} from 'lucide-react';
import React, {useEffect, useMemo, useState} from 'react';
import DisputeActionModal from "./DisputeActionModal.jsx";
import {processUserDisputes} from "./DisputeUtils.jsx";
import DisputeCard from "./DisputeCard.jsx";
import {
    fetchRequestsByUser, fetchRentalsByRequestIds, fetchDisputesByRentalIds,
    fetchListingsByIds, fetchUsersByIds
} from "../../services/service.js";
import {BORROWER_DISPUTE_ACTIONS, LENDER_DISPUTE_ACTIONS, ROLE} from "../util/Util.js";
import {useAuth, useToast} from "../AppContext.jsx";
import Loader from "../common/Loader.jsx";

export default function DisputeDashboard() {
    const {authenticatedUser} = useAuth();
    const {addToast} = useToast();
    const [loading, setLoading] = useState(true);
    const [appData, setAppData] = useState({disputes: [], rentals: [], requests: [], listings: [], accounts: []});
    const [modalState, setModalState] = useState({
        isOpen: false,
        action: '',
        disputeData: null
    });

    const closeModal = () => {
        setModalState({isOpen: false, action: '', disputeData: null});
    };
    const openActionModal = (actionType, disputeData) => {
        setModalState({isOpen: true, action: actionType, disputeData: disputeData});
    };
    const openOpponentDetails = (event, disputeData) => {
        event.preventDefault();
        event.stopPropagation();

        const actionType = ROLE.LENDER === disputeData.userRole ? LENDER_DISPUTE_ACTIONS.VIEW_BORROWER : BORROWER_DISPUTE_ACTIONS.VIEW_LENDER;

        setModalState({isOpen: true, action: actionType, disputeData: disputeData});
    };
    const openItemDetails = (disputeData) => {
        const actionType = ROLE.LENDER === disputeData.userRole ? LENDER_DISPUTE_ACTIONS.VIEW_ITEM : BORROWER_DISPUTE_ACTIONS.VIEW_ITEM;

        setModalState({isOpen: true, action: actionType, disputeData: disputeData});
    };

    const {
        pastDisputedBorrowedItems,
        currentDisputedBorrowedItems,
        pastDisputedLentItems,
        currentDisputedLentItems
    } = useMemo(() => {
        return processUserDisputes(appData, authenticatedUser.id);

    }, [appData.disputes, appData.rentals, appData.requests, appData.listings, authenticatedUser.id]);

    useEffect(() => {
        const fetchDisputeData = async () => {
            setLoading(true);

            // 1. Fetch ALL Requests involving the user (Lender OR Borrower)
            const {data: allRequests, error: reqError} = await fetchRequestsByUser(authenticatedUser.id);

            if (reqError) {
                addToast(`Error fetching requests: ${reqError.message || reqError}`);
                setLoading(false);
                return;
            }

            const requestIds = allRequests.map(req => req.id);
            const listingIds = [...new Set(allRequests.map(req => req.listing_id))];
            const uniqueAccountIds = [...new Set([
                ...allRequests.map(req => req.borrower_id),
                ...allRequests.map(req => req.lender_id)
            ])];

            // 2. Fetch Rentals associated with those requests
            const {data: rentalData, error: rentalError} = await fetchRentalsByRequestIds(requestIds);

            if (rentalError) {
                addToast(`Error fetching rentals: ${rentalError.message || rentalError}`);
                setLoading(false);
                return;
            }

            const rentalIds = rentalData ? rentalData.map(r => r.id) : [];

            // 3. Fetch Disputes linked to those Rentals
            const {data: disputeData, error: disputeError} = await fetchDisputesByRentalIds(rentalIds);

            if (disputeError) {
                addToast(`Error fetching disputes: ${disputeError.message || disputeError}`);
                setLoading(false);
                return;
            }

            // 4. Fetch Listings and Accounts
            const [{data: listingsData}, {data: accountsData}] = await Promise.all([
                fetchListingsByIds(listingIds),
                fetchUsersByIds(uniqueAccountIds, 'id, name, email'),
            ]);

            setAppData({
                disputes: disputeData || [],
                rentals: rentalData || [],
                requests: allRequests || [],
                listings: listingsData || [],
                accounts: accountsData || []
            });

            setLoading(false);
        };

        fetchDisputeData();
    }, []);

    if (loading) {
        return <Loader show={loading} message={'Loading Dispute Cases'}/>
    }

    return (
        <div className="py-8 max-w-5xl mx-auto">
            <h3 className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 text-3xl font-bold text-gray-800 mb-8">
                ⚖️ Dispute Center: Resolution Status
                <span className="text-base font-medium text-gray-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 mr-1 text-indigo-500"/>
                    Deposits held during review
                </span>
            </h3>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl space-y-8">

                {/* 1. Disputed Lent Items (Lender Role) */}
                <section>
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <Landmark className="w-6 h-6 mr-2 text-indigo-500"/>
                        Disputes on Lent Items
                    </h4>
                    <h6 className="text-lg font-semibold text-gray-800 mb-2 pb-2 flex items-center">
                        <ClockAlert className="w-5 h-5 mr-2 text-indigo-700"/>
                        Current Lent Items ({currentDisputedLentItems.length})
                    </h6>
                    {currentDisputedLentItems.length === 0 ? (
                        <div className="text-center py-2 text-gray-500 border rounded-xl bg-gray-50">
                            <CheckCheck className="w-6 h-6 mx-auto text-green-500"/>
                            <span className="font-medium">No active disputes for your lent items.</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentDisputedLentItems.map(disputeData => <DisputeCard key={disputeData.dispute.id}
                                                                                      disputeData={disputeData}
                                                                                      openItemDetails={openItemDetails}
                                                                                      openActionModal={openActionModal}
                                                                                      openOpponentDetails={openOpponentDetails}/>)}
                        </div>
                    )}

                    <h6 className="text-lg font-semibold text-gray-500 mt-4 mb-2 pb-2 flex items-center">
                        <Album className="w-5 h-5 mr-2 text-indigo-700"/>
                        Past Lent Items ({pastDisputedLentItems.length})
                    </h6>
                    {pastDisputedLentItems.length === 0 ? (
                        <div className="text-center py-2 text-gray-500 border rounded-xl bg-gray-50">
                            <CheckCheck className="w-6 h-6 mx-auto text-green-500"/>
                            <p className="font-medium">No past disputes for your lent items.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pastDisputedLentItems.map(disputeData => <DisputeCard key={disputeData.dispute.id}
                                                                                   disputeData={disputeData}
                                                                                   openItemDetails={openItemDetails}
                                                                                   openActionModal={openActionModal}
                                                                                   openOpponentDetails={openOpponentDetails}/>)}
                        </div>
                    )}
                </section>

                <hr className="border-t border-b mt-10 border-gray-200"/>

                {/* 2. Disputed Borrowed Items (Borrower Role) */}
                <section>
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <Handshake className="w-6 h-6 mr-2 text-red-500"/>
                        Disputes on Your Borrowed Items
                    </h4>
                    <h6 className="text-lg font-semibold text-gray-800 mb-2 pb-2 flex items-center">
                        <ClockAlert className="w-5 h-5 mr-2 text-indigo-700"/>
                        Current Borrowed Items ({currentDisputedBorrowedItems.length})
                    </h6>
                    {currentDisputedBorrowedItems.length === 0 ? (
                        <div className="text-center py-2 text-gray-500 border rounded-xl bg-gray-50">
                            <CheckCheck className="w-6 h-6 mx-auto text-green-500"/>
                            <p className="font-medium">No active disputes for your borrowed items.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentDisputedBorrowedItems.map(disputeData => <DisputeCard key={disputeData.dispute.id}
                                                                                          disputeData={disputeData}
                                                                                          openItemDetails={openItemDetails}
                                                                                          openActionModal={openActionModal}
                                                                                          openOpponentDetails={openOpponentDetails}/>)}
                        </div>
                    )}

                    <h6 className="text-lg font-semibold text-gray-500 mt-4 mb-2 pb-2 flex items-center">
                        <Album className="w-5 h-5 mr-2 text-indigo-700"/>
                        Past Borrowed Items ({pastDisputedBorrowedItems.length})
                    </h6>
                    {pastDisputedBorrowedItems.length === 0 ? (
                        <div className="text-center py-2 text-gray-500 border rounded-xl bg-gray-50">
                            <CheckCheck className="w-6 h-6 mx-auto text-green-500"/>
                            <p className="font-medium">No past disputes for your borrowed items.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pastDisputedBorrowedItems.map(disputeData => <DisputeCard key={disputeData.dispute.id}
                                                                                       disputeData={disputeData}
                                                                                       openItemDetails={openItemDetails}
                                                                                       openActionModal={openActionModal}
                                                                                       openOpponentDetails={openOpponentDetails}/>)}
                        </div>
                    )}
                </section>
            </div>

            <DisputeActionModal modalState={modalState}
                                closeModal={closeModal}
                                setAppData={setAppData}/>
        </div>
    );
}