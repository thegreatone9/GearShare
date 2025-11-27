import {CheckCheck, Handshake, Landmark, Shield,} from 'lucide-react';
import React, {useEffect, useMemo, useState} from 'react';
import DisputeActionModal from "./DisputeActionModal.jsx";
import {processUserDisputes} from "./DisputeUtils.jsx";
import DisputeCard from "./DisputeCard.jsx";
import {supabase} from "../../server/supabaseClient.js";
import {BORROWER_DISPUTE_ACTIONS, LENDER_DISPUTE_ACTIONS, ROLE} from "../util/Util.js";
import {useAuth, useToast} from "../AppContext.jsx";
import Loader from "../common/Loader.jsx";

export default function DisputeDashboard() {
    const {authenticatedUser} = useAuth();
    const {addToast} = useToast();
    const [loading, setLoading] = useState(true);
    const [appData, setAppData] = useState({ disputes: [], rentals: [], requests: [], listings: [], accounts: [] });
    const [modalState, setModalState] = useState({
        isOpen: false,
        action: '',
        dispute: null,
        opponentId: null,
        item: null
    });

    const closeModal = () => {
        setModalState({ isOpen: false, action: '', dispute: null, item: null, opponentId: null });
    };
    const openActionModal = (actionType, dispute) => {
        setModalState({ isOpen: true, action: actionType, dispute: dispute, item: null, opponentId: null });
    };
    const openOpponentDetails = (event, role, opponentId) => {
        event.preventDefault();
        event.stopPropagation();

        const actionType = ROLE.LENDER === role ? LENDER_DISPUTE_ACTIONS.VIEW_BORROWER : BORROWER_DISPUTE_ACTIONS.VIEW_LENDER;

        setModalState({ isOpen: true, action: actionType, dispute: null, item: null, opponentId: opponentId });
    };
    const openItemDetails = (role, item) => {
        const actionType = ROLE.LENDER === role ? LENDER_DISPUTE_ACTIONS.VIEW_ITEM : BORROWER_DISPUTE_ACTIONS.VIEW_ITEM;

        setModalState({ isOpen: true, action: actionType, dispute: null, opponentId: null, item: item });
    };

    const { disputedLentItems, disputedBorrowedItems } = useMemo(() => {
        return processUserDisputes(appData, authenticatedUser.id);

    }, [appData.disputes, appData.rentals, appData.requests, appData.listings, authenticatedUser.id]);

    useEffect(() => {
        const fetchDisputeData = async () => {
            setLoading(true);

            // 1. Fetch ALL Requests involving the user (Lender OR Borrower)
            const { data: allRequests, error: reqError } = await supabase
                .from('requests')
                .select('*')
                .or(`borrower_id.eq.${authenticatedUser.id},lender_id.eq.${authenticatedUser.id}`);

            if (reqError) {
                addToast(`Error fetching requests: ${reqError.message}`);
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
            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select('*')
                .in('request_id', requestIds);

            if (rentalError) {
                addToast(`Error fetching rentals: ${rentalError.message}`);
                setLoading(false);
                return;
            }

            const rentalIds = rentalData ? rentalData.map(r => r.id) : [];

            // 3. Fetch Disputes linked to those Rentals
            const { data: disputeData, error: disputeError } = await supabase
                .from('disputes')
                .select('*')
                .in('rental_id', rentalIds);

            if (disputeError) {
                addToast(`Error fetching disputes: ${disputeError.message}`);
                setLoading(false);
                return;
            }

            // 4. Fetch Listings
            const [{ data: listingsData }, { data: accountsData }] = await Promise.all([
                supabase.from('listings').select('*').in('id', listingIds),
                supabase.from('accounts').select('id, name, email').in('id', uniqueAccountIds),
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
                        Disputes on Your Lent Items ({disputedLentItems.length})
                    </h4>
                    {disputedLentItems.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 border rounded-xl bg-gray-50">
                            <CheckCheck className="w-8 h-8 mx-auto mb-3 text-green-500"/>
                            <p className="font-medium">No disputes currently active for your listings.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {disputedLentItems.map(dispute => <DisputeCard key={dispute.id}
                                                                           dispute={dispute}
                                                                           openItemDetails={openItemDetails}
                                                                           openActionModal={openActionModal}
                                                                           openOpponentDetails={openOpponentDetails} />)}
                        </div>
                    )}
                </section>

                <hr className="border-t border-gray-200"/>

                {/* 2. Disputed Borrowed Items (Borrower Role) */}
                <section>
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <Handshake className="w-6 h-6 mr-2 text-red-500"/>
                        Disputes on Your Borrowed Items ({disputedBorrowedItems.length})
                    </h4>
                    {disputedBorrowedItems.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 border rounded-xl bg-gray-50">
                            <CheckCheck className="w-8 h-8 mx-auto mb-3 text-green-500"/>
                            <p className="font-medium">No deposit claims currently filed against you.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {disputedBorrowedItems.map(dispute => <DisputeCard key={dispute.id}
                                                                               dispute={dispute}
                                                                               openItemDetails={openItemDetails}
                                                                               openActionModal={openActionModal}
                                                                               openOpponentDetails={openOpponentDetails} />)}
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