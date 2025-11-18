import {DISPUTE_STATUS} from "../util/Util.js";

export const getDisputeDisplay = (dispute) => {
    if (!dispute || dispute.status === DISPUTE_STATUS.COMPLETED) {
        return { label: 'Settled', color: 'bg-green-100 text-green-700' };
    }

    switch (dispute.status) {
        case DISPUTE_STATUS.PENDING_DEPOSIT_RETURN:
            return { label: 'Awaiting Your Review', color: 'bg-red-100 text-red-700' };
        case DISPUTE_STATUS.ACTIVE:
            return { label: 'Awaiting Borrower Evidence', color: 'bg-blue-100 text-blue-700' };
        default:
            return { label: dispute.status, color: 'bg-gray-100 text-gray-700' };
    }
};