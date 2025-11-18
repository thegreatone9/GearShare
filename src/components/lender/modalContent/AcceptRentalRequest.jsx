import React from 'react';
import {Calendar, DollarSign, Package, Star, User} from 'lucide-react';
import {RENTAL_STATUS} from "../../util/Util.js";
import {supabase} from "../../../server/supabaseClient.js";

/**
 * Content for the modal used to confirm a rental acceptance.
 * @param {Object} props - Contains request, item, borrower details, and action handlers.
 */
export default function AcceptRentalRequest({ request, item, borrower, onClose, setRequests, setLenderRentals, closeAllModals }) {
    if (!request || !item || !borrower) return (
        <div className="text-center text-red-500">Error: Missing request details.</div>
    );

    const confirmAcceptance = async () => {
        const { id, listing_id, borrower_id, lender_id } = request;

        const newRental = {
            id: Date.now(),
            request_id: id,
            listing_id: listing_id,
            borrower_id: borrower_id,
            lender_id: lender_id,
            return_date: null,
            status: RENTAL_STATUS.ACTIVE
        };

        const { data: rentalResult, error: rentalError } = await supabase
            .from('rentals')
            .insert([newRental])
            .single();

        if (rentalError) {
            return console.error("Error inserting new rental:", rentalError);
        }

        const { error: listingError } = await supabase
            .from('listings')
            .update({ listing_status: RENTAL_STATUS.ACTIVE })
            .eq('id', listing_id);

        if (listingError) {
            return console.error("Error updating listing status:", listingError);
        }

        const { error: requestError } = await supabase
            .from('requests')
            .delete()
            .eq('id', id);

        if (requestError) {
            return console.error("Error deleting request:", requestError);
        }

        setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
        setLenderRentals(prevRentals => [...prevRentals, rentalResult]);

        closeAllModals();
    };

    return (
        <div className="space-y-5">
            <p className="text-sm text-gray-500 mt-1">Review borrower details before finalizing the transaction.</p>

            {/* Item Summary */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="font-semibold text-gray-800 flex items-center mb-1">
                    <Package className="w-4 h-4 mr-2" />
                    Item: {item.title}
                </p>
                <p className="text-sm text-gray-600">
                    Price: ${item.price}/{item.unit} | Deposit Hold: ${request.deposit}
                </p>
            </div>

            {/* Borrower Details */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                    <User className="w-4 h-4 mr-2 text-indigo-600" />
                    Borrower: {borrower.name}
                </h4>
                <div className="flex text-sm text-gray-600 items-start">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0 mt-[2px]" />
                    <div className="flex flex-col items-start">
                        <p>Request Date: <span className="font-medium">{request.date}</span></p>
                        <p>Rent Start Date: <span className="font-medium">{request.start_date}</span></p>
                        <p>Rent End Date: <span className="font-medium">{request.end_date}</span></p>
                    </div>
                </div>
                <div className="flex text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                    <p>Total Rental Value: <span className="font-medium">${item.price} (Total)</span></p>
                </div>
                <div className="flex text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 flex-shrink-0 text-yellow-500"  />
                    <p>Rating: {item.rating}</p>
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
                    onClick={confirmAcceptance}
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
                >
                    Confirm & Accept Rental
                </button>
            </div>
        </div>
    );
}