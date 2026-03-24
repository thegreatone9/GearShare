/**
 * UI Utilities — Image helpers, colors, CSS class builders
 */

export const COLORS = [
    '6366f1', // Indigo
    'ef4444', // Red
    '22c55e', // Green
    '3b82f6', // Blue
    'a855f7', // Purple
    'f97316', // Orange
    'db2777', // Pink
    '0f766e'  // Teal
];

export const RANDOM_COLOR = function () {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export const itemImageSrc = function (image_url, title) {
    let img = image_url;
    // Parse JSON string from DB into object
    if (typeof img === 'string') {
        try { img = JSON.parse(img); } catch (_) { /* plain URL string — use as-is */ return img; }
    }
    return img?.url_1 || img?.url_2 || img?.url_3 || `https://placehold.co/600x400/${RANDOM_COLOR()}/FFFFFF?text=${title}`;
}

export const userImageSrc = function (title) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${title}`;
}

export const upperCaseFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isEmptyString = function (str) {
    return str === null || str === undefined || str.length === 0;
}

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
