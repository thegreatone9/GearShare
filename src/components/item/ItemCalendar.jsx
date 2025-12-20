import React from 'react';
import { DayPicker } from "react-day-picker";
import classNames from "react-day-picker/style.module.css";
import {formatDateStr, ROLE} from "../util/Util.js";

export default function ItemCalendar({
                                         role, // 'lender' or 'borrower'
                                         selectedRange,
                                         onSelect,
                                         disabledDays,
                                         dateRangeStr,
                                         error,
                                         defaultMonth
                                     }) {
    // Helper to determine start/end display strings based on object shape
    const getStartDate = () => {
        if (role === ROLE.LENDER) return dateRangeStr.from;
        return dateRangeStr.start_date;
    };
    const getEndDate = () => {
        if (role === ROLE.LENDER) return dateRangeStr.to;
        return dateRangeStr.end_date;
    };

    const startStr = getStartDate();
    const endStr = getEndDate();

    return (
        <div className="flex flex-col items-center">
            {error && (
                <p className="font-medium text-red-500 mb-2">{error}</p>
            )}

            <div className="text-gray-700 text-center mb-4">
                {startStr && endStr ? (
                    <>
                        <span className="font-bold">{formatDateStr(startStr)}</span> to{' '}
                        <span className="font-bold">{formatDateStr(endStr)}</span>
                    </>
                ) : (
                    <span>Please select a date range.</span>
                )}
            </div>

            <div className="flex justify-center border p-4 rounded-xl bg-white shadow-sm">
                <DayPicker
                    mode="range"
                    selected={selectedRange}
                    onSelect={onSelect}
                    disabled={disabledDays}
                    defaultMonth={defaultMonth || new Date()}
                    showOutsideDays={false}
                    classNames={classNames}
                />
            </div>
        </div>
    );
}