import React, {useEffect, useState} from 'react';
import {Calendar, DollarSign, Package, Star, User} from 'lucide-react';
import {LISTING_STATUS, RENTAL_STATUS, REQUEST_STATUS} from "../../util/Util.js";
import {supabase} from "../../../server/supabaseClient.js";
import Loader from "../../common/Loader.jsx";

/**
 * Content for the modal used to confirm a rental acceptance.
 * @param {Object} props - Contains request, item, borrower details, and action handlers.
 */
export default function AcceptRentalRequest({ request, onClose, setRequests, setLenderRentals, closeAllModals }) {
    if (!request) return (
        <div className="text-center text-red-500">Error: Missing request details.</div>
    );

    const [borrower, setBorrower] = useState(null);
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const { id, listing_id: listingId, borrower_id: borrowerId, lender_id: lenderId } = request;

    useEffect(() => {
        const fetchData = async function () {
            const { data: itemData, error: itemError } = await supabase
                .from('listings')
                .select('*')
                .eq('id', listingId)
                .single();

            if (itemError) console.error("Error fetching item:", itemError);
            setItem(itemData);

            const { data: borrowerData, error: borrowerError } = await supabase
                .from('accounts')
                .select('name, email')
                .eq('id', borrowerId)
                .single();

            if (borrowerError) console.error("Error fetching borrower:", borrowerError);
            setBorrower(borrowerData);
        }

        fetchData()
            .then(() => setLoading(false));

    }, [request]);

    const confirmAcceptance = async () => {
        const { data: rentalResult, error: rpcError } = await supabase.rpc(
            'confirm_rental_acceptance',
            {
                request_id: id,
                listing_id: listingId,
                borrower_id: borrowerId,
                lender_id: lenderId,
                listing_status: LISTING_STATUS.RENTED,
                rental_status: RENTAL_STATUS.ACTIVE,
                request_status: REQUEST_STATUS.COMPLETED
            }
        ).single();

        if (rpcError) {
            throw new Error(`Rental Request Acceptance Transaction failed: ${rpcError.message}`);
        }

        setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
        setLenderRentals(prevRentals => [...prevRentals, rentalResult]);

        closeAllModals();
    };

    if (loading) {
        return <Loader show={loading} message={'Loading Request Details'}/>
    }

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
                    Price: ${item.price}/{item.time_unit} | Deposit Hold: ${item.replacement_value}
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
                    <p>Rating: {item.condition}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end space-x-3 bg-gray-50 -mb-6 p-6 rounded-b-xl">
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