import { MessageSquareWarning, Shield, Eye, Gavel, CheckCheck, Landmark, Handshake } from 'lucide-react';
import React, { useMemo } from 'react';

// Helper function to map raw status, considering the user's role, to minimal UI details
const getStatusDetails = (status, userRole) => {
    // --- Minimal MVP Status Mapping ---

    if (status === 'pendingDepositReturn') {
        // Maps to PENDING_DEPOSIT_RELEASE in the minimal flow
        if (userRole === 'Lender') {
            return {
                label: 'Awaiting Your Review',
                color: 'bg-red-100 text-red-700', // Red to highlight the critical action needed from the lender
                action: 'Review / File Claim',
                actionIcon: Shield,
                showAction: true,
                buttonClass: 'bg-red-600 hover:bg-red-700'
            };
        }
        // Borrower's view (passive)
        return {
            label: 'Awaiting Lender Review',
            color: 'bg-yellow-100 text-yellow-700',
            action: 'View Status',
            actionIcon: Eye,
            showAction: true,
            buttonClass: 'bg-indigo-600 hover:bg-indigo-700'
        };
    }

    if (status === 'active') {
        // Maps to DISPUTE_ACTIVE in the minimal flow (Lender has claimed deposit)
        if (userRole === 'Borrower') {
            return {
                label: 'Lender Claim Filed: Action Required',
                color: 'bg-red-100 text-red-700', // Critical, requires borrower response
                action: 'Submit Evidence',
                actionIcon: MessageSquareWarning,
                showAction: true,
                buttonClass: 'bg-red-600 hover:bg-red-700'
            };
        }
        // Lender's view (passive—waiting for borrower's evidence)
        return {
            label: 'Awaiting Borrower Evidence',
            color: 'bg-blue-100 text-blue-700',
            action: 'View Claim Details',
            actionIcon: Eye,
            showAction: true,
            buttonClass: 'bg-indigo-600 hover:bg-indigo-700'
        };
    }

    if (status === 'completed') {
        // Maps to the final SETTLED state
        return {
            label: 'Case Settled',
            color: 'bg-green-100 text-green-700',
            action: 'View Final Report',
            actionIcon: Gavel,
            showAction: true,
            buttonClass: 'bg-indigo-600 hover:bg-indigo-700'
        };
    }

    return { label: status, color: 'bg-gray-100 text-gray-700', action: 'View Details', actionIcon: Eye, showAction: true, buttonClass: 'bg-gray-600 hover:bg-gray-700' };
};

// --- Component Definition ---

export default function DisputeDashboard({ authenticatedUser, appData }) {
    const { disputes, rentals, requests, listings } = appData;
    const userId = authenticatedUser.id;

    const { disputedLentItems, disputedBorrowedItems } = useMemo(() => {
        const allRelevantDisputes = disputes
            .map(dispute => {
                const rental = rentals.find(r => r.disputeId === dispute.id);
                if (!rental) return null;

                const request = requests.find(r => r.id === rental.requestId);
                if (!request) return null;

                const isLender = request.lenderId === userId;
                const isBorrower = request.borrowerId === userId;

                // Include only disputes relevant to the authenticated user
                if (!isLender && !isBorrower) return null;

                const listing = listings.find(l => l.id === request.listingId);
                const itemTitle = listing ? listing.title : 'Unknown Item';
                const userRole = isLender ? 'Lender' : 'Borrower';

                const statusDetails = getStatusDetails(dispute.status, userRole);

                return {
                    id: dispute.id,
                    itemTitle: itemTitle,
                    userRole: userRole,
                    isLent: isLender, // NEW FIELD for filtering
                    ...statusDetails,
                };
            })
            .filter(d => d !== null); // Filter out irrelevant disputes

        // Separate the results into two arrays
        const disputedLentItems = allRelevantDisputes.filter(d => d.isLent);
        const disputedBorrowedItems = allRelevantDisputes.filter(d => !d.isLent);

        return { disputedLentItems, disputedBorrowedItems };

    }, [disputes, rentals, requests, listings, userId]);


    // --- Dispute Card Renderer Helper ---
    const DisputeCard = ({ dispute }) => {
        const ActionIcon = dispute.actionIcon;
        return (
            <div key={dispute.id}
                 className="p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:bg-gray-50 transition duration-150">
                <div className="flex-grow">
                    <p className="font-semibold text-lg text-gray-900">Case #{dispute.id} - {dispute.itemTitle}</p>
                    <p className="text-sm text-gray-600 mt-1">Your Role: <span
                        className="font-bold text-indigo-700">{dispute.userRole}</span></p>
                </div>

                <div className="mt-3 sm:mt-0 text-left sm:text-right flex items-center space-x-3">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${dispute.color} shadow-sm`}>
                        {dispute.label}
                    </span>

                    {dispute.showAction && (
                        <button
                            // Placeholder action to simulate navigating to the dispute details page
                            onClick={() => console.log(`Action: ${dispute.action} for Dispute ${dispute.id}`)}
                            className={`text-sm text-white px-4 py-2 rounded-lg transition flex items-center font-medium shadow-md ${dispute.buttonClass}`}>
                            <ActionIcon className="w-4 h-4 mr-2"/>
                            {dispute.action}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // --- Render Logic ---
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
                            {disputedLentItems.map(dispute => <DisputeCard key={dispute.id} dispute={dispute} />)}
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
                            {disputedBorrowedItems.map(dispute => <DisputeCard key={dispute.id} dispute={dispute} />)}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}