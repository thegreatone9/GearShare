import {DISPUTE_STATUS} from "../util/Util.js";

export const getDisputeDisplay = (dispute) => {
    if (!dispute || dispute.status === DISPUTE_STATUS.COMPLETED) {
        return { label: 'Settled', color: 'bg-green-100 text-green-700' };
    }

    switch (dispute.status) {
        case DISPUTE_STATUS.PENDING_DEPOSIT_RETURN:
            return { label: 'Awaiting Lender Review', color: 'bg-yellow-100 text-yellow-700' };
        case DISPUTE_STATUS.ACTIVE:
            return { label: 'Lender Claim Filed', color: 'bg-red-100 text-red-700' };
        default:
            return { label: dispute.status, color: 'bg-gray-100 text-gray-700' };
    }
};