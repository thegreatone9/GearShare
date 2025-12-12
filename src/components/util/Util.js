import Cookies from "js-cookie";
import AcceptRentalRequest from "../lender/modalContent/AcceptRentalRequest.jsx";
import ModalItemDetails from "../common/ModalItemDetails.jsx";
import UserDetails from "../common/UserDetails.jsx";
import {format} from "date-fns";

export const IMG_NOT_FOUND_URL = 'https://tmuiycpixqjawkspqpiu.supabase.co/storage/v1/object/public/GearShare%20Assets/img-not-found.png';

export const ROLE = {
    LENDER: 'lender',
    BORROWER: 'borrower',
    ADMIN: 'admin'
}

export const LISTING_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
}

export const RENTAL_STATUS = {
    PENDING_BORROW: 'pendingBorrow',
    ACTIVE: 'active',
    RETURNED: 'returned',
    COMPLETED: 'completed'
}

export const REQUEST_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    DECLINED: 'declined'
}

export const DISPUTE_STATUS = {
    PENDING_DEPOSIT_RETURN: 'pendingDepositReturn',
    CLAIM_FILED: 'claimFiled',
    BORROWER_EVIDENCE_SUBMITTED: 'borrowerEvidenceSubmitted',
    JUDGED: 'judged',
    COMPLETED: 'completed'
}

export const LENDER_ITEM_ACTIONS = {
    SAVE: 'save',
    DELETE: 'delete'
}

export const BORROWER_ITEM_ACTIONS = {
    REQUEST_BORROW: 'requestBorrow'
}

export const LENDER_DISPUTE_ACTIONS = {
    FILE_CLAIM: 'fileClaim',
    SETTLE: 'settle',
    VIEW_CLAIM_DETAILS: 'viewClaimDetails',
    VIEW_REPORT: 'viewReport',
    VIEW_BORROWER: 'viewBorrower',
    VIEW_ITEM: 'viewItem'
}

export const BORROWER_DISPUTE_ACTIONS = {
    VIEW_CLAIM_DETAILS: 'viewClaimDetails',
    SUBMIT_EVIDENCE: 'submitEvidence',
    VIEW_REPORT: 'viewReport',
    PAY_DAMAGES: 'payDamages',
    VIEW_LENDER: 'viewLender',
    VIEW_ITEM: 'viewItem'
}

export const TIME_UNIT = {
    HOUR: 'hour',
    DAY: 'day',
    MONTH: 'month'
}

export const LISTING_CATEGORY = {
    ANY: 'Category: Any',
    ELECTRONICS: 'Electronics',
    SPORTS: 'Sports',
    TRAVEL: 'Travel',
    HOUSEHOLD: 'Household',
    EDUCATION: 'Education',
    MEDICAL: 'Medical',
    FOOD: 'Food',
    MUSIC: 'Music',
    OTHERS: 'Others'
}

export const LISTING_CONDITION = {
    ONE: '1',
    TWO: '2',
    THREE: '3',
    FOUR: '4',
    FIVE: '5'
}

export const TOAST_TYPE = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
}

export const updateUserCookie = function (user) {
    const userDataString = JSON.stringify({
        name: user.name,
        email: user.email,
        id: user.id
    });

    Cookies.set('user_data', userDataString, {
        expires: 1,
        secure: true,
        sameSite: 'Strict'
    });
}

export const checkSession = async function () {
    const useDataCookie = Cookies.get('user_data');

    if (useDataCookie) {
        return JSON.parse(useDataCookie);
    }
};

export const getUserSessionData = function (user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email
    }
}

export const parseDDMMYYYY = function (dateString) {
    if (!dateString || dateString.length !== 10) return null;
    const parts = dateString.split('-');
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[0], 10);

    const date = new Date(year, month, day);

    return date.getFullYear() === year && date.getMonth() === month ? date : null;
};

export const formatDateStr = function (dateStr) {
    return format(new Date(dateStr), 'MMM dd, yyyy');
}

export const MODAL_CATEGORY = {
    ITEM: 'item',
    ACCEPT_RENTAL_REQUEST: 'acceptRentalRequest',
    BORROWER: 'borrower',
    LENDER: 'lender'
}

export const ModalComponentMap = {
    [MODAL_CATEGORY.ACCEPT_RENTAL_REQUEST]: AcceptRentalRequest,
    [MODAL_CATEGORY.ITEM]: ModalItemDetails,
    [MODAL_CATEGORY.BORROWER]: UserDetails,
    [MODAL_CATEGORY.LENDER]: UserDetails

    // Can add other generic item modals here as needed (e.g., disputeReview, returnFlow)
};

export const getStatusClasses = (type) => {
    switch (type) {
        case 'success':
            return 'bg-green-100 border-green-500 text-green-700';
        case 'error':
            return 'bg-red-100 border-red-500 text-red-700';
        case 'warning':
            return 'bg-yellow-100 border-yellow-500 text-yellow-700';
        default:
            return 'hidden';
    }
};

export const isEmptyString = function (str) {
    return str === null || str === undefined || str.length === 0;
}

/**
 * Makes an API request with proper error handling
 * @param {string} endpoint - API endpoint (e.g., '/api/marketplace')
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} options.params - URL search parameters
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.headers - Additional headers
 * @returns {Promise<{data: any, error: string|null}>}
 */
export async function apiRequest(endpoint, options = {}) {
    const {
        method = 'GET',
        params = null,
        body = null,
        headers = {}
    } = options;

    try {
        // Build URL with query parameters
        let url = endpoint;
        if (params) {
            const searchParams = new URLSearchParams(params);
            url = `${endpoint}?${searchParams.toString()}`;
        }

        // Build fetch options
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        // Add body for non-GET requests
        if (body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(body);
        }

        // Make request
        const response = await fetch(url, fetchOptions);

        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text();
            return {
                data: null,
                error: `HTTP ${response.status}: ${errorText || response.statusText}`
            };
        }

        // Parse and return data
        const data = await response.json();
        return {data, error: null};

    } catch (error) {
        return {
            data: null,
            error: error.message || 'An unknown error occurred'
        };
    }
}