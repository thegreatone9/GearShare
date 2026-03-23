/**
 * Re-export shim — for backward compatibility.
 *
 * All utilities have been split into focused modules under src/utils/.
 * New code should import directly from:
 *   - @/utils/constants.js
 *   - @/utils/auth.js
 *   - @/utils/date.js
 *   - @/utils/api.js
 *   - @/utils/rental.js
 *   - @/utils/ui.js
 */

// Constants & Enums
export {
    IMG_NOT_FOUND_URL, ADMIN_ID, ACTIVITY, ROLE, LISTING_STATUS, RENTAL_STATUS,
    REQUEST_STATUS, DISPUTE_STATUS, LENDER_ITEM_ACTIONS, PAYMENT_INTENT_STATUS,
    TRANSACTION_STATUS, BORROWER_ITEM_ACTIONS, LENDER_DISPUTE_ACTIONS,
    BORROWER_DISPUTE_ACTIONS, TIME_UNIT, LISTING_CATEGORY, LISTING_CONDITION,
    TOAST_TYPE, MODAL_CATEGORY
} from '../../utils/constants.js';

// Auth & Session
export { updateUserCookie, checkSession, getUserSessionData } from '../../utils/auth.js';

// Date Utilities
export { parseDDMMYYYY, formatDateStr } from '../../utils/date.js';

// API Client
export { apiRequest } from '../../utils/api.js';

// Rental Calculations
export { calculateRentalFee, calculateDuration } from '../../utils/rental.js';

// UI Helpers
export { COLORS, RANDOM_COLOR, itemImageSrc, userImageSrc, upperCaseFirstLetter, isEmptyString, getStatusClasses } from '../../utils/ui.js';