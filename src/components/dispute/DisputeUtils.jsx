import {DollarSign, Eye, FileText, MessageSquareWarning, XCircle} from 'lucide-react';
import {CLIENT_DISPUTE_ACTIONS, DISPUTE_STATUS, MERCHANT_DISPUTE_ACTIONS, ROLE} from "../util/Util.js";

export const processUserDisputes = (appData, userId) => {
    const { disputes, rentals, requests, listings } = appData;

    const allRelevantDisputes = disputes
        .map(dispute => {
            const rental = rentals.find(r => r.id === dispute.rental_id);
            if (!rental) return null;

            // 2. Link Rental to Request
            const request = requests.find(r => r.id === rental.request_id);
            if (!request) return null;

            // 3. Determine User Role
            const isMerchant = request.merchant_id === userId;
            const isClient = request.client_id === userId;

            // Filter out disputes the user isn't involved in
            if (!isMerchant && !isClient) return null;

            // 4. Get Listing Details
            const listing = listings.find(l => l.id === request.listing_id);
            const userRole = isMerchant ? ROLE.MERCHANT : ROLE.CLIENT;

            // 5. Get Status Details using the external helper function
            const statusDetails = getStatusDetails(dispute, userRole);

            return {
                dispute: dispute,
                item: listing,
                request: request,
                rental: rental,
                userRole: userRole,
                isLent: isMerchant, // Used for final categorization
                opponentId: isMerchant ? request.client_id : request.merchant_id,
                ...statusDetails,
            };
        })
        .filter(d => d !== null); // Remove disputes not involving the user

    // Categorize into Lent (Merchant Role) and Borrowed (Client Role)
    const disputedLentItems = allRelevantDisputes.filter(d => d.isLent);
    const disputedBorrowedItems = allRelevantDisputes.filter(d => !d.isLent);

    const pastDisputedBorrowedItems = disputedBorrowedItems.filter(
        d => d.dispute.status === DISPUTE_STATUS.COMPLETED
    );
    const currentDisputedBorrowedItems = disputedBorrowedItems.filter(
        d => d.dispute.status !== DISPUTE_STATUS.COMPLETED
    );

    const pastDisputedLentItems = disputedLentItems.filter(
        d => d.dispute.status === DISPUTE_STATUS.COMPLETED
    );
    const currentDisputedLentItems = disputedLentItems.filter(
        d => d.dispute.status !== DISPUTE_STATUS.COMPLETED
    );

    return { pastDisputedBorrowedItems, currentDisputedBorrowedItems, pastDisputedLentItems, currentDisputedLentItems };
};

export const ACTION_ICONS = {
    [MERCHANT_DISPUTE_ACTIONS.SETTLE]: DollarSign,
    [MERCHANT_DISPUTE_ACTIONS.FILE_CLAIM]: XCircle,
    [MERCHANT_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS]: Eye,
    [MERCHANT_DISPUTE_ACTIONS.VIEW_REPORT]: FileText,
    [CLIENT_DISPUTE_ACTIONS.SUBMIT_EVIDENCE]: MessageSquareWarning,
    [CLIENT_DISPUTE_ACTIONS.VIEW_REPORT]: FileText,
    [CLIENT_DISPUTE_ACTIONS.PAY_DAMAGES]: DollarSign
};

const getStatusDetails = (dispute, userRole) => {
    const status = dispute.status;

    if (status === DISPUTE_STATUS.PENDING_DEPOSIT_RETURN) {
        if (userRole === ROLE.MERCHANT) {
            return {
                label: 'Awaiting Your Review',
                color: 'bg-red-100 text-red-700',
                actions: [MERCHANT_DISPUTE_ACTIONS.SETTLE, MERCHANT_DISPUTE_ACTIONS.FILE_CLAIM]
            };
        }
        // Client's view (passive)
        return {
            label: 'Awaiting Merchant Review',
            color: 'bg-yellow-100 text-yellow-700',
            actions: []
        };
    }

    if (status === DISPUTE_STATUS.CLAIM_FILED) {
        if (userRole === ROLE.CLIENT) {
            return {
                label: 'Merchant Claim Filed: Action Required',
                color: 'bg-red-100 text-red-700',
                actions: [CLIENT_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS, CLIENT_DISPUTE_ACTIONS.SUBMIT_EVIDENCE],
            };
        }
        // Merchant's view (passive—waiting for client's evidence)
        return {
            label: 'Awaiting Client Evidence',
            color: 'bg-blue-100 text-blue-700',
            actions: [MERCHANT_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS]
        };
    }

    if (status === DISPUTE_STATUS.JUDGED) {
        if (userRole === ROLE.CLIENT) {
            return {
                label: 'Judgement Pronounced: Action Required',
                color: 'bg-red-100 text-red-700',
                actions: [CLIENT_DISPUTE_ACTIONS.PAY_DAMAGES, CLIENT_DISPUTE_ACTIONS.VIEW_REPORT],
            };
        }
        // Merchant's view (passive—waiting for client to pay damages)
        return {
            label: 'Judgement Pronounced: Awaiting Client Damages',
            color: 'bg-indigo-100 text-indigo-700',
            actions: [MERCHANT_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS, MERCHANT_DISPUTE_ACTIONS.VIEW_REPORT]
        };
    }

    if (status === DISPUTE_STATUS.COMPLETED) {
        const actions = [];

        if (dispute.judgement_details) {
            if (userRole === ROLE.CLIENT) {
                actions.push(CLIENT_DISPUTE_ACTIONS.VIEW_REPORT);

            } else if (userRole === ROLE.MERCHANT) {
                actions.push(MERCHANT_DISPUTE_ACTIONS.VIEW_REPORT);
            }
        }

        return {
            label: 'Case Settled',
            color: 'bg-green-100 text-green-700',
            // Client should also be able to view the final report
            actions: actions
        };
    }

    return {
        label: status,
        color: 'bg-gray-100 text-gray-700',
        actions: []
    };
};