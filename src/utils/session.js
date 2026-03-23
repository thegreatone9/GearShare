/**
 * Saves a key-value pair to the browser's session storage.
 * @param {string} key - The identifier for the data (e.g., 'searchTerm').
 * @param {any} value - The data to store (will be converted to JSON string).
 */
export const saveSessionVariable = (key, value) => {
    try {
        const serializedValue = JSON.stringify(value);
        sessionStorage.setItem(key, serializedValue);

    } catch (e) {
        console.error(`Error saving session variable "${key}":`, e);
    }
};

/**
 * Retrieves a variable from session storage and parses it back to its original type.
 * @param {string} key - The identifier for the data.
 * @returns {any | null} The parsed data, or null if the key is not found.
 */
export const retrieveSessionVariable = (key) => {
    try {
        const serializedValue = sessionStorage.getItem(key);
        if (serializedValue === null) {
            return null;
        }

        return JSON.parse(serializedValue);

    } catch (e) {
        console.error(`Error retrieving session variable "${key}":`, e);
        return null;
    }
};

/**
 * Removes a specific key from session storage.
 * @param {string} key - The identifier for the data to clear.
 */
export const clearSessionVariable = (key) => {
    try {
        sessionStorage.removeItem(key);

    } catch (e) {
        console.error(`Error clearing session variable "${key}":`, e);
    }
};

/**
 * Clears all data currently stored in session storage.
 */
export const clearAllSessionVariables = () => {
    try {
        sessionStorage.clear();

    } catch (e) {
        console.error("Error clearing all session variables:", e);
    }
};