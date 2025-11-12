import {DollarSign, Eye, FileText, MessageSquareWarning, XCircle} from 'lucide-react';
import {BORROWER_DISPUTE_ACTIONS, DISPUTE_STATUS, LENDER_DISPUTE_ACTIONS} from "../util/Util.js";

export const getStatusDetails = (status, userRole) => {
    if (status === DISPUTE_STATUS.PENDING_DEPOSIT_RETURN) {
        if (userRole === 'Lender') {
            return {
                label: 'Awaiting Your Review',
                color: 'bg-red-100 text-red-700',
                actions: [LENDER_DISPUTE_ACTIONS.SETTLE, LENDER_DISPUTE_ACTIONS.FILE_CLAIM],
                showAction: true
            };
        }
        // Borrower's view (passive)
        return {
            label: 'Awaiting Lender Review',
            color: 'bg-yellow-100 text-yellow-700',
            actions: [],
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

export const ACTION_ICONS = {
    [LENDER_DISPUTE_ACTIONS.SETTLE]: DollarSign,
    [LENDER_DISPUTE_ACTIONS.FILE_CLAIM]: XCircle,
    [LENDER_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS]: Eye,
    [LENDER_DISPUTE_ACTIONS.VIEW_REPORT]: FileText,
    [BORROWER_DISPUTE_ACTIONS.SUBMIT_EVIDENCE]: MessageSquareWarning, // Used MessageSquareWarning for evidence submission
    [BORROWER_DISPUTE_ACTIONS.VIEW_REPORT]: FileText,
    [BORROWER_DISPUTE_ACTIONS.PAY_DAMAGES]: DollarSign
};