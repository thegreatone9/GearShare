/**
 * Date Utilities — Date parsing and formatting
 */

import {format} from "date-fns";

export const parseDDMMYYYY = function (dateString) {
    if (!dateString || dateString.length !== 10) return null;
    const parts = dateString.split('-');
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[0], 10);

    const date = new Date(year, month, day);

    return date.getFullYear() === year && date.getMonth() === month ? date : null;
};

export const formatDateStr = function (dateStr) {
    return format(new Date(dateStr), 'MMM dd, yyyy');
}
