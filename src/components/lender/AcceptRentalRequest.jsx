import React from 'react';
import {Calendar, DollarSign, Package, User} from 'lucide-react';

/**
 * Content for the modal used to confirm a rental acceptance.
 * @param {Object} props - Contains request, item, borrower details, and action handlers.
 */
export default function AcceptRentalRequest({ request, item, borrower, onClose, onConfirm }) {
    if (!request || !item || !borrower) return (
        <div className="text-center text-red-500">Error: Missing request details.</div>
    );

    return (
        <div className="space-y-5">
            <p className="text-sm text-gray-500 mt-1">Review borrower details before finalizing the transaction.</p>

            {/* Item Summary */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="font-semibold text-gray-800 flex items-center mb-1">
                    <Package className="w-4 h-4 mr-2" />
                    Item: {item.title}
                </p>
                <p className="text-sm text-gray-600 ml-6">
                    Price: ${item.price}/{item.unit} | Deposit Hold: ${request.deposit}
                </p>
            </div>

            {/* Borrower Details */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                    <User className="w-4 h-4 mr-2 text-indigo-600" />
                    Borrower: {borrower.name}
                </h4>
                <div className="flex text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <p>Requested Dates: <span className="font-medium">{request.duration}</span></p>
                </div>
                <div className="flex text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                    <p>Total Rental Value: <span className="font-medium">${item.price * 2} (Mock Total)</span></p>
                </div>
                <div className="flex text-sm text-gray-600">
                    {/* MOCK: Replace with actual rating display */}
                    <p>Rating: <span className="font-medium text-yellow-500">★★★★☆</span> (4.9)</p>
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end space-x-3 bg-gray-50 -mb-6 p-6 rounded-b-xl">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                    Dismiss / Back
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
                >
                    Confirm & Accept Rental
                </button>
            </div>
        </div>
    );
}