import {supabase} from "./supabaseClient.js";

// =============================================================================
// Accounts
// =============================================================================

export async function addAccount(userData) {
    return await supabase
        .from('accounts')
        .insert([{
            email: userData.email,
            name: userData.name,
            password: userData.password
        }])
        .select()
        .single();
}

export async function authenticateUser(email, password) {
    return await supabase.from('accounts')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();
}

export async function isUserExists(email) {
    const {data} = await supabase
        .from('accounts')
        .select('id')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

    return !!data;
}

export async function fetchUserByEmail(email) {
    return await supabase.from('accounts')
        .select('*')
        .eq('email', email)
        .single();
}

export async function fetchUserById(id, columns = '*') {
    return await supabase
        .from('accounts')
        .select(columns)
        .eq('id', id)
        .single();
}

export async function fetchUsersByIds(ids, columns = 'id, name, email') {
    return await supabase
        .from('accounts')
        .select(columns)
        .in('id', ids);
}

export async function updateAccount(id, data) {
    return await supabase
        .from('accounts')
        .update(data)
        .eq('id', id);
}

// =============================================================================
// Listings
// =============================================================================

export async function fetchListingById(id) {
    return await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();
}

export async function fetchListingsByIds(ids) {
    return await supabase
        .from('listings')
        .select('*')
        .in('id', ids);
}

export async function searchListings({status, searchTerm, location, category, listingType}) {
    let query = supabase
        .from('listings_with_availability')
        .select('*')
        .eq('status', status);

    if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (location) {
        query = query.ilike('location', `%${location}%`);
    }

    if (category) {
        query = query.eq('category', category);
    }

    if (listingType) {
        query = query.eq('listing_type', listingType);
    }

    return await query;
}

export async function fetchListingWithAvailability(id) {
    return await supabase
        .from('listings_with_availability')
        .select('*')
        .eq('id', id)
        .single();
}

// =============================================================================
// Listings Available Dates
// =============================================================================

export async function fetchAvailability(listingId) {
    return await supabase
        .from('listings_available_dates')
        .select('*')
        .eq('listing_id', listingId)
        .single();
}

export async function fetchAvailabilityColumns(listingId, columns) {
    return await supabase
        .from('listings_available_dates')
        .select(columns)
        .eq('listing_id', listingId)
        .single();
}

// =============================================================================
// Requests
// =============================================================================

export async function fetchRequestsByClient(clientId) {
    return await supabase
        .from('requests')
        .select('*')
        .eq('client_id', clientId);
}

export async function fetchRequestsByMerchant(merchantId) {
    return await supabase
        .from('requests')
        .select('*')
        .eq('merchant_id', merchantId);
}

export async function fetchRequestsByUser(userId) {
    return await supabase
        .from('requests')
        .select('*')
        .or(`client_id.eq.${userId},merchant_id.eq.${userId}`);
}

export async function fetchActiveRequestDates(listingId, clientId, status) {
    return await supabase
        .from('requests')
        .select('start_date, end_date')
        .eq('listing_id', listingId)
        .eq('client_id', clientId)
        .eq('status', status);
}

export async function fetchRequestById(id, columns = '*') {
    return await supabase
        .from('requests')
        .select(columns)
        .eq('id', id)
        .single();
}

export async function deleteRequest(id) {
    return await supabase
        .from('requests')
        .delete()
        .eq('id', id);
}

// =============================================================================
// Rentals
// =============================================================================

export async function fetchRentalsByRequestIds(requestIds) {
    return await supabase
        .from('rentals')
        .select('*, request_id')
        .in('request_id', requestIds);
}

export async function fetchRentalById(id) {
    return await supabase
        .from('rentals')
        .select('*')
        .eq('id', id)
        .single();
}

// =============================================================================
// Disputes
// =============================================================================

export async function fetchDisputesByRentalIds(rentalIds) {
    return await supabase
        .from('disputes')
        .select('*')
        .in('rental_id', rentalIds);
}

export async function updateDispute(id, updateData) {
    return await supabase
        .from('disputes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
}

// =============================================================================
// Activity Log
// =============================================================================

export async function fetchActivityLog(userId) {
    return await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {ascending: false});
}

// =============================================================================
// Generic table fetch (used by LenderDashboard's fetchTable pattern)
// =============================================================================

export async function fetchFromTable(table, filters = {}) {
    let query = supabase.from(table).select('*');
    Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
    });
    return await query;
}
