/**
 * Service Layer — Strategy Pattern Router
 *
 * Selects the appropriate implementation based on environment:
 * - Production: supabaseService.js (uses @supabase/supabase-js)
 * - Development: localService.js (uses fetch() → local Express/SQLite server)
 *
 * Components import from this file and never touch supabase directly.
 */

const isLocal = import.meta.env.VITE_USE_LOCAL_DB === 'true';

let impl;

if (isLocal) {
    impl = await import('./localService.js');
} else {
    impl = await import('./supabaseService.js');
}

// --- Accounts ---
export const addAccount           = impl.addAccount;
export const authenticateUser     = impl.authenticateUser;
export const isUserExists         = impl.isUserExists;
export const fetchUserByEmail     = impl.fetchUserByEmail;
export const fetchUserById        = impl.fetchUserById;
export const fetchUsersByIds      = impl.fetchUsersByIds;
export const updateAccount        = impl.updateAccount;

// --- Listings ---
export const fetchListingById             = impl.fetchListingById;
export const fetchListingsByIds           = impl.fetchListingsByIds;
export const searchListings               = impl.searchListings;
export const fetchListingWithAvailability = impl.fetchListingWithAvailability;

// --- Listings Available Dates ---
export const fetchAvailability        = impl.fetchAvailability;
export const fetchAvailabilityColumns = impl.fetchAvailabilityColumns;

// --- Requests ---
export const fetchRequestsByBorrower   = impl.fetchRequestsByBorrower;
export const fetchRequestsByLender     = impl.fetchRequestsByLender;
export const fetchRequestsByUser       = impl.fetchRequestsByUser;
export const fetchActiveRequestDates   = impl.fetchActiveRequestDates;
export const fetchRequestById          = impl.fetchRequestById;
export const deleteRequest             = impl.deleteRequest;

// --- Rentals ---
export const fetchRentalsByRequestIds = impl.fetchRentalsByRequestIds;
export const fetchRentalById          = impl.fetchRentalById;

// --- Disputes ---
export const fetchDisputesByRentalIds = impl.fetchDisputesByRentalIds;
export const updateDispute            = impl.updateDispute;

// --- Activity Log ---
export const fetchActivityLog = impl.fetchActivityLog;

// --- Generic ---
export const fetchFromTable = impl.fetchFromTable;
