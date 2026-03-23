// =============================================================================
// Local/Dev implementation — calls the local Express dev server via fetch()
// Stubbed initially; filled in at Step 4
// =============================================================================

const API_BASE = '/api/db';

async function get(table, params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/${table}?${searchParams}`);
    if (!res.ok) {
        const errText = await res.text();
        return {data: null, error: errText};
    }
    const data = await res.json();
    return {data, error: null};
}

async function getSingle(table, params = {}) {
    const {data, error} = await get(table, {...params, single: 'true'});
    return {data: data, error};
}

async function post(table, body, params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/${table}?${searchParams}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errText = await res.text();
        return {data: null, error: errText};
    }
    const data = await res.json();
    return {data, error: null};
}

async function patch(table, body, params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/${table}?${searchParams}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errText = await res.text();
        return {data: null, error: errText};
    }
    const data = await res.json();
    return {data, error: null};
}

async function del(table, params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/${table}?${searchParams}`, {
        method: 'DELETE'
    });
    if (!res.ok) {
        const errText = await res.text();
        return {data: null, error: errText};
    }
    return {data: null, error: null};
}

// =============================================================================
// Accounts
// =============================================================================

export async function addAccount(userData) {
    return await post('accounts', {
        email: userData.email,
        name: userData.name,
        password: userData.password
    }, {single: 'true'});
}

export async function authenticateUser(email, password) {
    return await getSingle('accounts', {
        'eq.email': email,
        'eq.password': password
    });
}

export async function isUserExists(email) {
    const {data} = await get('accounts', {
        select: 'id',
        'eq.email': email,
        limit: '1'
    });
    return !!(data && data.length > 0);
}

export async function fetchUserByEmail(email) {
    return await getSingle('accounts', {'eq.email': email});
}

export async function fetchUserById(id, columns = '*') {
    return await getSingle('accounts', {select: columns, 'eq.id': id});
}

export async function fetchUsersByIds(ids, columns = 'id, name, email') {
    return await get('accounts', {select: columns, 'in.id': ids.join(',')});
}

export async function updateAccount(id, data) {
    return await patch('accounts', data, {'eq.id': id});
}

// =============================================================================
// Listings
// =============================================================================

export async function fetchListingById(id) {
    return await getSingle('listings', {'eq.id': id});
}

export async function fetchListingsByIds(ids) {
    return await get('listings', {'in.id': ids.join(',')});
}

export async function searchListings({status, searchTerm, location, category}) {
    const params = {'eq.status': status};
    if (searchTerm) params['or'] = `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`;
    if (location) params['ilike.location'] = `%${location}%`;
    if (category) params['eq.category'] = category;

    return await get('listings_with_availability', params);
}

export async function fetchListingWithAvailability(id) {
    return await getSingle('listings_with_availability', {'eq.id': id});
}

// =============================================================================
// Listings Available Dates
// =============================================================================

export async function fetchAvailability(listingId) {
    return await getSingle('listings_available_dates', {'eq.listing_id': listingId});
}

export async function fetchAvailabilityColumns(listingId, columns) {
    return await getSingle('listings_available_dates', {
        select: columns,
        'eq.listing_id': listingId
    });
}

// =============================================================================
// Requests
// =============================================================================

export async function fetchRequestsByBorrower(borrowerId) {
    return await get('requests', {'eq.borrower_id': borrowerId});
}

export async function fetchRequestsByLender(lenderId) {
    return await get('requests', {'eq.lender_id': lenderId});
}

export async function fetchRequestsByUser(userId) {
    return await get('requests', {
        'or': `borrower_id.eq.${userId},lender_id.eq.${userId}`
    });
}

export async function fetchActiveRequestDates(listingId, borrowerId, status) {
    return await get('requests', {
        select: 'start_date,end_date',
        'eq.listing_id': listingId,
        'eq.borrower_id': borrowerId,
        'eq.status': status
    });
}

export async function fetchRequestById(id, columns = '*') {
    return await getSingle('requests', {select: columns, 'eq.id': id});
}

export async function deleteRequest(id) {
    return await del('requests', {'eq.id': id});
}

// =============================================================================
// Rentals
// =============================================================================

export async function fetchRentalsByRequestIds(requestIds) {
    return await get('rentals', {'in.request_id': requestIds.join(',')});
}

export async function fetchRentalById(id) {
    return await getSingle('rentals', {'eq.id': id});
}

// =============================================================================
// Disputes
// =============================================================================

export async function fetchDisputesByRentalIds(rentalIds) {
    return await get('disputes', {'in.rental_id': rentalIds.join(',')});
}

export async function updateDispute(id, updateData) {
    return await patch('disputes', updateData, {'eq.id': id, single: 'true'});
}

// =============================================================================
// Activity Log
// =============================================================================

export async function fetchActivityLog(userId) {
    return await get('activity_log', {
        'eq.user_id': userId,
        order: 'created_at.desc'
    });
}

// =============================================================================
// Generic table fetch
// =============================================================================

export async function fetchFromTable(table, filters = {}) {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
        params[`eq.${key}`] = value;
    });
    return await get(table, params);
}
