import React, {useEffect, useState} from 'react';
import {Calendar, DollarSign, Package, Star, User} from 'lucide-react';
import {
    apiRequest,
    calculateRentalFee,
    RENTAL_STATUS,
    REQUEST_STATUS,
    TIME_UNIT,
    upperCaseFirstLetter
} from "../../util/Util.js";
import {fetchListingWithAvailability, fetchUserById} from "../../../services/service.js";
import Loader from "../../common/Loader.jsx";

/**
 * Content for the modal used to confirm a rental acceptance.
 * @param {Object} props - Contains request, item, client details, and action handlers.
 */
export default function AcceptRentalRequest({request, onClose, setRequests, setMerchantRentals, closeAllModals}) {
    if (!request) return (
        <div className="text-center text-red-500">Error: Missing request details.</div>
    );

    const [client, setClient] = useState(null);
    const [itemWithAvailability, setItemWithAvailability] = useState(null);
    const [loading, setLoading] = useState(true);

    const {id, listing_id: listingId, borrower_id: borrowerId, lender_id: lenderId, listing_snapshot: listingSnapshot} = request;
    const pricePerUnit = listingSnapshot.daily_rate;

    useEffect(() => {
        const fetchData = async function () {
            const {data: itemData, error: itemError} = await fetchListingWithAvailability(listingId);

            if (itemError) console.error("Error fetching item:", itemError);
            setItemWithAvailability(itemData);

            const {data: clientData, error: clientError} = await fetchUserById(borrowerId, 'name, email');

            if (clientError) console.error("Error fetching client:", clientError);
            setClient(clientData);
        }

        fetchData()
            .then(() => setLoading(false));

    }, [request]);

    const confirmAcceptance = async () => {
        const { error: rpcError} = await apiRequest(
            '/api/confirmRental',
            {
                method: 'POST',
                body: {
                    requestId: id,
                    borrowerId: borrowerId,
                    lenderId: lenderId,
                    listingId: listingId,
                    rentalStatus: RENTAL_STATUS.ACTIVE,
                    requestStatus: REQUEST_STATUS.COMPLETED,
                    otherRequestStatus: REQUEST_STATUS.DECLINED,
                    activeRequestStatus: REQUEST_STATUS.ACTIVE
                }
            }
        );

        if (rpcError) {
            throw new Error(`Rental Request Acceptance Transaction failed: ${rpcError}`);
        }

        closeAllModals();
        window.location.reload();
    };

    if (loading) {
        return <Loader show={loading} message={'Loading Request Details'}/>
    }

    return (
        <div className="space-y-5">
            <p className="text-sm text-gray-500 mt-1">Review client details before finalizing the transaction.</p>

            {/* Item Summary */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="font-semibold text-gray-800 flex items-center mb-1">
                    <Package className="w-4 h-4 mr-2"/>
                    Item: {itemWithAvailability.title}
                </p>
                <p className="text-sm text-gray-600">
                    Daily Rate: ${pricePerUnit}/{TIME_UNIT.DAY} | Deposit Hold:
                    ${listingSnapshot.replacement_value}
                </p>
            </div>

            {/* Client Details */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-800 flex items-center mb-2">
                    <User className="w-4 h-4 mr-2 text-indigo-600"/>
                    Client: {client.name}
                </h4>
                <div className="flex text-sm text-gray-600 items-start">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0 mt-[2px]"/>
                    <div className="flex flex-col items-start">
                        <p>Request Date: <span className="font-medium">{request.date}</span></p>
                        <p>Rent Start Date: <span className="font-medium">{request.start_date}</span></p>
                        <p>Rent End Date: <span className="font-medium">{request.end_date}</span></p>
                    </div>
                </div>
                <div className="flex text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0"/>
                    <p>Total Rental Value: <span className="font-medium">${calculateRentalFee(TIME_UNIT.DAY, pricePerUnit, request.start_date, request.end_date)} (Total)</span>
                    </p>
                </div>
                <div className="flex text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 flex-shrink-0 text-yellow-500"/>
                    <p>Rating: {itemWithAvailability.condition}</p>
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
