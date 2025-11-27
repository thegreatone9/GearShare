import Cookies from "js-cookie";
import AcceptRentalRequest from "../lender/modalContent/AcceptRentalRequest.jsx";
import ModalItemDetails from "../common/ModalItemDetails.jsx";
import UserDetails from "../common/UserDetails.jsx";

export const IMG_NOT_FOUND_URL = 'https://tmuiycpixqjawkspqpiu.supabase.co/storage/v1/object/public/GearShare%20Assets/img-not-found.png';

export const ROLE = {
    LENDER: 'lender',
    BORROWER: 'borrower',
    ADMIN: 'admin'
}

export const LISTING_STATUS = {
    AVAILABLE: 'available',
    RENTED: 'rented'
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

export const MODAL_CATEGORY= {
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

export const MOCK_DATA = {
    accounts: [
        { id: 1, email: "tom@gearshare.com", password: "password", name: "Tom Hanks" },
        { id: 2, email: "jane@gearshare.com", password: "password", name: "Jane Doe" }
    ],

    listings: [
        { id: 1, ownerId: 2, title: "Cordless Drill Set", price: 15, unit: TIME_UNIT.DAY, location: "Downtown LA", rating: 4.8, replacementValue: 150, imageUrl: "https://placehold.co/300x200/4F46E5/FFFFFF?text=Drill" },

        { id: 2, ownerId: 1, title: "DJI Mavic Mini Drone", price: 35, unit: TIME_UNIT.DAY, location: "Santa Monica", rating: 4.5, replacementValue: 800, imageUrl: "https://placehold.co/300x200/10B981/FFFFFF?text=Drone" },

        { id: 3, ownerId: 2, title: "Professional Steam Iron", price: 5, unit: TIME_UNIT.DAY, location: "Venice Beach", rating: 4.9, replacementValue: 60, imageUrl: "https://placehold.co/300x200/F97316/FFFFFF?text=Iron" },

        { id: 4, ownerId: 1, title: "Fender Acoustic Guitar", price: 100, unit: TIME_UNIT.DAY, location: "Culver City", rating: 5.0, replacementValue: 450, imageUrl: "https://placehold.co/300x200/EC4899/FFFFFF?text=Guitar" },

        { id: 5, ownerId: 2, title: "Keyboard", price: 20, unit: TIME_UNIT.DAY, location: "Montana City", rating: 5.0, replacementValue: 20, imageUrl: "https://placehold.co/300x200/EC4899/FFFFFF?text=Keyboard" },

        { id: 6, ownerId: 1, title: "Camera", price: 500, unit: TIME_UNIT.DAY, location: "Vermont", rating: 5.0, replacementValue: 450, imageUrl: "https://placehold.co/300x200/EC4899/FFFFFF?text=Camera" },

        { id: 7, ownerId: 2, title: "Skateboard", price: 50, unit: TIME_UNIT.DAY, location: "Jericho", rating: 5.0, replacementValue: 30, imageUrl: "https://placehold.co/300x200/EC4899/FFFFFF?text=Skateboard" },
    ],

    requests: [
        { id: 501, listingId: 1, borrowerId: 1, lenderId: 2, date: "09/09/25", rentStartDate: "10/09/25", rentEndDate: "15/12/25", status: REQUEST_STATUS.COMPLETED, deposit: "500" },
        { id: 502, listingId: 2, borrowerId: 2, lenderId: 1, date: "09/09/25", rentStartDate: "10/09/25", rentEndDate: "15/12/25", status: REQUEST_STATUS.COMPLETED, deposit: null },
        { id: 503, listingId: 3, borrowerId: 1, lenderId: 2, date: "09/09/25", rentStartDate: "10/09/25", rentEndDate: "15/10/25", status: REQUEST_STATUS.COMPLETED, deposit: "500" },
        { id: 504, listingId: 4, borrowerId: 2, lenderId: 1, date: "09/09/25", rentStartDate: "10/09/25", rentEndDate: "15/10/25", status: REQUEST_STATUS.COMPLETED, deposit: null },
        { id: 505, listingId: 5, borrowerId: 1, lenderId: 2, date: "09/11/25", rentStartDate: null, rentEndDate: null, status: REQUEST_STATUS.ACTIVE, deposit: null },
    ],

    disputes: [
        { id: 901, rentalId: 203, startDate: "15/10/25", endDate: null, status: DISPUTE_STATUS.ACTIVE, lender_claim_description: null, borrower_defense_description: null, damage_amount: null  },
        { id: 902, rentalId: 204, startDate: "15/10/25", endDate: null, status: DISPUTE_STATUS.PENDING_DEPOSIT_RETURN, lender_claim_description: null, borrower_defense_description: null, damage_amount: null },
        { id: 903, rentalId: 205, startDate: "14/10/25", endDate: "15/10/25", status: DISPUTE_STATUS.COMPLETED, lender_claim_description: null, borrower_defense_description: null, damage_amount: null }
    ],

    rentals: [
        { id: 201, requestId: 501, status: RENTAL_STATUS.ACTIVE, returnDate: null, disputeId: null },

        { id: 202, requestId: 502, status: RENTAL_STATUS.ACTIVE, returnDate: null, disputeId: null },

        { id: 203, requestId: 503, status: RENTAL_STATUS.COMPLETED, returnDate: "17/10/25", disputeId: 901 },

        { id: 204, requestId: 504, status: RENTAL_STATUS.COMPLETED, returnDate: "16/10/25", disputeId: 902 },

        { id: 205, requestId: 504, status: RENTAL_STATUS.COMPLETED, returnDate: "14/10/25", disputeId: 903 }
    ]
};