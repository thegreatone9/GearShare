/**
 * Rental Calculations — Business logic for rental fees and durations
 */

import {TIME_UNIT} from './constants.js';

export const calculateRentalFee = (unit, pricePerUnit, start, end) => {
    const duration = calculateDuration(start, end, unit);
    return duration * pricePerUnit;
};

export const calculateDuration = (start, end, unit = TIME_UNIT.DAY) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffInMs = endDate - startDate;

    if (diffInMs < 0) {
        return 0;
    }

    const MS_PER_HOUR = 1000 * 60 * 60;
    const MS_PER_DAY = MS_PER_HOUR * 24;

    let duration = 0;

    if (unit === TIME_UNIT.HOUR) {
        duration = diffInMs / MS_PER_HOUR;
    } else if (unit === TIME_UNIT.DAY) {
        duration = diffInMs / MS_PER_DAY;
    }

    return Math.max(1, Math.ceil(duration));
};
