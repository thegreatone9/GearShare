import {
    CheckCheck,
    DollarSign,
    Eye,
    FileText,
    Handshake,
    Landmark,
    MessageSquareWarning,
    Shield,
    XCircle
} from 'lucide-react';
import React, {useMemo} from 'react';
// Assuming BORROWER_ACTIONS, DISPUTE_STATUS, and LENDER_ACTIONS are correctly imported
import {BORROWER_DISPUTE_ACTIONS, DISPUTE_STATUS, LENDER_DISPUTE_ACTIONS} from "../util/Util.js";

// Mapping icons used in the helper functions
const ACTION_ICONS = {
    [LENDER_DISPUTE_ACTIONS.SETTLE]: DollarSign,
    [LENDER_DISPUTE_ACTIONS.FILE_CLAIM]: XCircle,
    [LENDER_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS]: Eye,
    [LENDER_DISPUTE_ACTIONS.VIEW_REPORT]: FileText,
    [BORROWER_DISPUTE_ACTIONS.SUBMIT_EVIDENCE]: MessageSquareWarning, // Used MessageSquareWarning for evidence submission
    [BORROWER_DISPUTE_ACTIONS.VIEW_REPORT]: FileText,
    [BORROWER_DISPUTE_ACTIONS.PAY_DAMAGES]: DollarSign
};


// Helper function to map raw status, considering the user's role, to minimal UI details
const getStatusDetails = (status, userRole) => {
    // --- Minimal MVP Status Mapping ---

    if (status === DISPUTE_STATUS.PENDING_DEPOSIT_RETURN) {
        if (userRole === 'Lender') {
            return {
                label: 'Awaiting Your Review',
                color: 'bg-red-100 text-red-700',
                actions: [LENDER_DISPUTE_ACTIONS.SETTLE, LENDER_DISPUTE_ACTIONS.FILE_CLAIM], // Settle first (positive action)
                showAction: true
            };
        }
        // Borrower's view (passive)
        return {
            label: 'Awaiting Lender Review',
            color: 'bg-yellow-100 text-yellow-700',
            actions: [BORROWER_DISPUTE_ACTIONS.VIEW_STATUS], // Consistent use of actions array
            showAction: true
        };
    }

    if (status === DISPUTE_STATUS.ACTIVE) {
        if (userRole === 'Borrower') {
            return {
                label: 'Lender Claim Filed: Action Required',
                color: 'bg-red-100 text-red-700',
                actions: [BORROWER_DISPUTE_ACTIONS.SUBMIT_EVIDENCE], // Consistent use of actions array
                showAction: true
            };
        }
        // Lender's view (passive—waiting for borrower's evidence)
        return {
            label: 'Awaiting Borrower Evidence',
            color: 'bg-blue-100 text-blue-700',
            actions: [LENDER_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS],
            showAction: true
        };
    }

    if (status === DISPUTE_STATUS.COMPLETED) {
        // Assuming a final resolution requires both parties to view the report
        return {
            label: 'Case Settled',
            color: 'bg-green-100 text-green-700',
            // Borrower should also be able to view the final report
            actions: [LENDER_DISPUTE_ACTIONS.VIEW_REPORT],
            showAction: true
        };
    }

    // Default case is simplified to use the consistent 'actions' array pattern
    return {
        label: status,
        color: 'bg-gray-100 text-gray-700',
        actions: [LENDER_DISPUTE_ACTIONS.VIEW_REPORT],
        showAction: true
    };
};

// --- Component Definition ---

export default function DisputeDashboard({ authenticatedUser, appData, setAppData }) {
    const { disputes, rentals, requests, listings } = appData;
    const userId = authenticatedUser.id;

    const { disputedLentItems, disputedBorrowedItems } = useMemo(() => {
        // ... (existing useMemo filtering logic remains unchanged) ...
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


    // --- Handlers ---

    // Handler for Settle/Release Deposit
    const handleSettle = (disputeId) => {
        setAppData(prevData => {
            const updatedDisputes = prevData.disputes.map(d =>
                d.id === disputeId
                    ? { ...d, status: DISPUTE_STATUS.COMPLETED } // Settle immediately moves to COMPLETED
                    : d
            );
            return { ...prevData, disputes: updatedDisputes };
        });
        console.log(`ACTION: Lender settled deposit for Case #${disputeId}`);
    };

    // Handler for File Claim (Moves status to ACTIVE)
    const handleFileClaim = function (disputeId) {
        setAppData(prevData => {
            const updatedDisputes = prevData.disputes.map(d =>
                d.id === disputeId
                    ? { ...d, status: DISPUTE_STATUS.ACTIVE, endDate: Date.now() } // Moves to ACTIVE for borrower response
                    : d
            );
            return { ...prevData, disputes: updatedDisputes };
        });
        console.log(`ACTION: Lender filed claim for Case #${disputeId}`);
    }

    const viewClaimDetails = (disputeId) => console.log(`ACTION: View Claim Details for Case #${disputeId}`);
    const viewReport = (disputeId) => console.log(`ACTION: View Report for Case #${disputeId}`);
    const viewStatus = (disputeId) => console.log(`ACTION: Borrower View Status for Case #${disputeId}`);
    const submitEvidence = (disputeId) => console.log(`ACTION: Submit Counter-evidence for Case #${disputeId}`);
    const payDamages = (disputeId) => console.log(`ACTION: Pay Damages for Case #${disputeId}`);


    // --- Action Card Definitions (Corrected to use handlers with ID) ---
    const LENDER_ACTION_CARD = {
        [LENDER_DISPUTE_ACTIONS.SETTLE]: {
            onClick: (id) => handleSettle(id),
            icon: ACTION_ICONS[LENDER_DISPUTE_ACTIONS.SETTLE],
            label: 'Settle',
            className: 'bg-green-600 hover:bg-green-700'
        },
        [LENDER_DISPUTE_ACTIONS.FILE_CLAIM]: {
            onClick: (id) => handleFileClaim(id),
            icon: ACTION_ICONS[LENDER_DISPUTE_ACTIONS.FILE_CLAIM],
            label: 'File Claim',
            className: 'bg-red-600 hover:bg-red-700'
        },
        [LENDER_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS]: {
            onClick: (id) => viewClaimDetails(id),
            icon: ACTION_ICONS[LENDER_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS],
            label: 'View Claim Details',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [LENDER_DISPUTE_ACTIONS.VIEW_REPORT]: {
            onClick: (id) => viewReport(id),
            icon: ACTION_ICONS[LENDER_DISPUTE_ACTIONS.VIEW_REPORT],
            label: 'View Report',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        }
    }

    const BORROWER_ACTION_CARD = {
        [BORROWER_DISPUTE_ACTIONS.SUBMIT_EVIDENCE]: {
            onClick: (id) => submitEvidence(id),
            icon: ACTION_ICONS[BORROWER_DISPUTE_ACTIONS.SUBMIT_EVIDENCE],
            label: 'Submit Evidence',
            className: 'bg-red-600 hover:bg-red-700'
        },
        [BORROWER_DISPUTE_ACTIONS.VIEW_REPORT]: {
            onClick: (id) => viewReport(id),
            icon: ACTION_ICONS[BORROWER_DISPUTE_ACTIONS.VIEW_REPORT],
            label: 'View Report',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [BORROWER_DISPUTE_ACTIONS.VIEW_STATUS]: {
            onClick: (id) => viewStatus(id),
            icon: Eye,
            label: 'View Status',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [BORROWER_DISPUTE_ACTIONS.PAY_DAMAGES]: {
            onClick: (id) => payDamages(id),
            icon: ACTION_ICONS[BORROWER_DISPUTE_ACTIONS.PAY_DAMAGES],
            label: 'Pay Damages',
            className: 'bg-red-600 hover:bg-red-700'
        }
    }

    // --- Dispute Card Renderer Helper (Fixed JSX Loop) ---
    const DisputeCard = ({ dispute }) => {
        const isLender = dispute.userRole === 'Lender';
        const actionMap = isLender ? LENDER_ACTION_CARD : BORROWER_ACTION_CARD;

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

                    {/* *** FIXED: Renders all action buttons in a single flex container *** */}
                    {dispute.showAction && (
                        <div className="flex space-x-2">
                            {
                                dispute.actions.map(actionKey => {
                                    const actionProps = actionMap[actionKey];
                                    if (!actionProps) return null; // Safety check
                                    const ActionIcon = actionProps.icon;

                                    return (
                                        <button
                                            key={actionKey}
                                            onClick={() => actionProps.onClick(dispute.id)}
                                            className={`text-sm text-white px-4 py-2 rounded-lg transition flex items-center font-medium shadow-md ${actionProps.className}`}>
                                            <ActionIcon className="w-4 h-4 mr-2"/>
                                            {actionProps.label}
                                        </button>
                                    )
                                })
                            }
                        </div>
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