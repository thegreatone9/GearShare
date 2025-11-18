import React from 'react';
import { Link } from 'react-router-dom';
import { RENTAL_STATUS } from '../util/Util.js'; // Assuming correct path

/**
 * Reusable component to render one list section (e.g., Active Rentals, Inventory).
 * * @param {object} props
 * @param {string} title - The section title (e.g., "Active Rentals (3)")
 * @param {ReactNode} Icon - Lucide React icon component for the header.
 * @param {string} iconColor - Tailwind color class for the icon (e.g., 'text-indigo-500').
 * @param {Array<object>} list - The filtered array of items/rentals to display.
 * @param {function} renderItem - Function to render the JSX for a single item in the list.
 * @param {string} emptyMessage - Message to display when the list is empty.
 * @param {ReactNode} [HeaderAction] - Optional button or link (like 'Go to Disputes Dashboard').
 */
export default function DashboardListSection({
                                                 title,
                                                 Icon,
                                                 iconColor,
                                                 list,
                                                 renderItem,
                                                 emptyMessage,
                                                 HeaderAction
                                             }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h4 className={`text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center justify-between`}>
                <span className="flex items-center">
                    <Icon className={`w-7 h-7 mr-2 ${iconColor}`} />
                    {title}
                </span>
                {HeaderAction}
            </h4>

            <div className="space-y-4">
                {list.length > 0 ? (
                    list.map(renderItem)
                ) : (
                    <p className="text-center text-sm text-gray-500 py-4 border rounded-lg">{emptyMessage}</p>
                )}
            </div>
        </div>
    );
}