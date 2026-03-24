/**
 * Service Layer — Strategy Pattern Router
 *
 * Selects the appropriate implementation based on environment:
 * - Production: supabaseService.js (uses @supabase/supabase-js)
 * - Development: localService.js (uses fetch() → local Express/SQLite server)
 *
 * Components import from this file and never touch supabase directly.
 *
 * Uses a lazy-init promise instead of top-level await for broader
 * build-target compatibility (Safari 14, ES2020, etc.).
 */

const isLocal = import.meta.env.VITE_USE_LOCAL_DB === 'true';

const implPromise = isLocal
    ? import('./localService.js')
    : import('./supabaseService.js');

/**
 * Helper — wraps each exported function in a thin async wrapper
 * that awaits the implementation module on first call.
 */
function lazy(fnName) {
    return async (...args) => {
        const impl = await implPromise;
        return impl[fnName](...args);
    };
}

// --- Accounts ---
export const addAccount           = lazy('addAccount');
export const authenticateUser     = lazy('authenticateUser');
export const isUserExists         = lazy('isUserExists');
export const fetchUserByEmail     = lazy('fetchUserByEmail');
export const fetchUserById        = lazy('fetchUserById');
export const fetchUsersByIds      = lazy('fetchUsersByIds');
export const updateAccount        = lazy('updateAccount');

// --- Listings ---
export const fetchListingById             = lazy('fetchListingById');
export const fetchListingsByIds           = lazy('fetchListingsByIds');
export const searchListings               = lazy('searchListings');
export const fetchListingWithAvailability = lazy('fetchListingWithAvailability');

// --- Listings Available Dates ---
export const fetchAvailability        = lazy('fetchAvailability');
export const fetchAvailabilityColumns = lazy('fetchAvailabilityColumns');

// --- Requests ---
export const fetchRequestsByClient     = lazy('fetchRequestsByClient');
export const fetchRequestsByMerchant   = lazy('fetchRequestsByMerchant');
export const fetchRequestsByUser       = lazy('fetchRequestsByUser');
export const fetchActiveRequestDates   = lazy('fetchActiveRequestDates');
export const fetchRequestById          = lazy('fetchRequestById');
export const deleteRequest             = lazy('deleteRequest');

// --- Rentals ---
export const fetchRentalsByRequestIds = lazy('fetchRentalsByRequestIds');
export const fetchRentalById          = lazy('fetchRentalById');

// --- Disputes ---
export const fetchDisputesByRentalIds = lazy('fetchDisputesByRentalIds');
export const updateDispute            = lazy('updateDispute');

// --- Activity Log ---
export const fetchActivityLog = lazy('fetchActivityLog');

// --- Generic ---
export const fetchFromTable = lazy('fetchFromTable');
