/**
 * Constants & Enums — All domain-specific constant values
 */

export const IMG_NOT_FOUND_URL = 'https://tmuiycpixqjawkspqpiu.supabase.co/storage/v1/object/public/GearShare%20Assets/img-not-found.png';

export const ADMIN_ID = {
    ESCROW: 16,
    ADMIN: 17,
}

export const ACTIVITY = {
    UPSERT_ITEM: 'UPSERT_ITEM',
    REQUEST_ITEM: 'REQUEST_ITEM',
    CONFIRM_RENTAL: 'CONFIRM_RENTAL',
    DECLINE_REQUEST: 'DECLINE_REQUEST',
    DELETE_LISTING: 'DELETE_LISTING',
    PAY_DAMAGES: 'PAY_DAMAGES',
    RETURN_ITEM_CREATE_DISPUTE: 'RETURN_ITEM_CREATE_DISPUTE',
    SETTLE_DISPUTE: 'SETTLE_DISPUTE'
}

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

export const PAYMENT_INTENT_STATUS = {
    REQUIRES_PAYMENT_METHOD: 'REQUIRES_PAYMENT_METHOD',
    AUTHORIZED: 'AUTHORIZED',
    CAPTURED: 'CAPTURED',
    RELEASED: 'RELEASED',
    REFUNDED: 'REFUNDED',
    PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
    CANCELLED: 'CANCELLED',
    SETTLED: 'SETTLED'
}

export const TRANSACTION_STATUS = {
    SECURITY_DEPOSIT: 'REQUIRES_PAYMENT_METHOD',
    DEPOSIT_REFUND: 'AUTHORIZED',
    RENTAL_FEE: 'CAPTURED',
    DAMAGE_FEE: 'RELEASED',
    DAMAGE_OVERAGE: 'REFUNDED'
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
    DAY: 'day'
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

export const MODAL_CATEGORY = {
    ITEM: 'item',
    ACCEPT_RENTAL_REQUEST: 'acceptRentalRequest',
    BORROWER: 'borrower',
    LENDER: 'lender'
}
