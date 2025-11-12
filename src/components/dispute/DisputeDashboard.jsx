import {CheckCheck, Handshake, Landmark, Shield,} from 'lucide-react';
import React, {useMemo, useState} from 'react';
import DisputeActionModal from "./DisputeActionModal.jsx";
import {getStatusDetails} from "./DisputeUtils.jsx";
import DisputeCard from "./DisputeCard.jsx";

export default function DisputeDashboard({ authenticatedUser, appData, setAppData }) {
    const { disputes, rentals, requests, listings } = appData;
    const userId = authenticatedUser.id;

    const [modalState, setModalState] = useState({
        isOpen: false,
        action: null,
        dispute: null,
    });

    const closeModal = () => {
        setModalState({ isOpen: false, action: null, dispute: null });
    };

    const openActionModal = (actionType, dispute) => {
        setModalState({ isOpen: true, action: actionType, dispute: dispute });
    };

    const { disputedLentItems, disputedBorrowedItems } = useMemo(() => {
        const allRelevantDisputes = disputes
            .map(dispute => {
                const rental = rentals.find(r => r.disputeId === dispute.id);
                if (!rental) return null;

                const request = requests.find(r => r.id === rental.requestId);
                if (!request) return null;

                const isLender = request.lenderId === userId;
                const isBorrower = request.borrowerId === userId;

                if (!isLender && !isBorrower) return null;

                const listing = listings.find(l => l.id === request.listingId);
                const itemTitle = listing ? listing.title : 'Unknown Item';
                const userRole = isLender ? 'Lender' : 'Borrower';

                const statusDetails = getStatusDetails(dispute.status, userRole);

                return {
                    id: dispute.id,
                    itemTitle: itemTitle,
                    userRole: userRole,
                    isLent: isLender,
                    ...statusDetails,
                };
            })
            .filter(d => d !== null);

        const disputedLentItems = allRelevantDisputes.filter(d => d.isLent);
        const disputedBorrowedItems = allRelevantDisputes.filter(d => !d.isLent);

        return { disputedLentItems, disputedBorrowedItems };

    }, [disputes, rentals, requests, listings, userId]);

    return (
        <div className="py-8 max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 flex justify-between items-center">
                ⚖️ Dispute Center: Resolution Status
                <span className="text-base font-medium text-gray-500 flex items-center">
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
                            {disputedLentItems.map(dispute => <DisputeCard key={dispute.id} dispute={dispute} openActionModal={openActionModal} />)}
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
                            {disputedBorrowedItems.map(dispute => <DisputeCard key={dispute.id} dispute={dispute} openActionModal={openActionModal} />)}
                        </div>
                    )}
                </section>
            </div>

            <DisputeActionModal selectedAction={modalState.action}
                                dispute={modalState.dispute}
                                closeModal={closeModal}
                                setAppData={setAppData}/>
        </div>
    );
}