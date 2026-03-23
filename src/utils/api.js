/**
 * API Client — Generic fetch wrapper for backend calls
 */

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
        let url = endpoint;
        if (params) {
            const searchParams = new URLSearchParams(params);
            url = `${endpoint}?${searchParams.toString()}`;
        }

        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const errorText = await response.text();
            return {
                data: null,
                error: `HTTP ${response.status}: ${errorText || response.statusText}`
            };
        }

        const data = await response.json();
        return {data, error: null};

    } catch (error) {
        return {
            data: null,
            error: error.message || 'An unknown error occurred'
        };
    }
}
