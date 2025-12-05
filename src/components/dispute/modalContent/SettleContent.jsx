import React from 'react';
import {DollarSign} from 'lucide-react';
import {DISPUTE_STATUS, LISTING_STATUS, RENTAL_STATUS, TOAST_TYPE} from "../../util/Util.js";
import {supabase} from "../../../server/supabaseClient.js";
import {useToast} from "../../AppContext.jsx";

export default function SettleContent({ disputeData, onClose, setAppData }) {
    const {addToast} = useToast();
    const disputeId = disputeData.dispute.id;
    const item = disputeData.item;

    const handleSettle = async (event) => {
        event.preventDefault();

        const { data: updatedDispute, error } = await supabase.rpc(
            "resolve_dispute_and_update_listing",
            {
                dispute_id: disputeId,
                rental_id: disputeData.rental.id,
                rental_status: RENTAL_STATUS.COMPLETED,
                dispute_status: DISPUTE_STATUS.COMPLETED
            }
        );

        if (error) {
            addToast(TOAST_TYPE.ERROR, `Failed to settle rental: ${error.message}`);

            return;
        }

        setAppData(prevData => {
            const updatedDisputes = prevData.disputes.map(d =>
                d.id === disputeId
                    ? { ...d, status: updatedDispute.status, end_date: updatedDispute.end_date }
                    : d
            );
            return { ...prevData, disputes: updatedDisputes };
        });

        console.log(`CONFIRMED ACTION: Lender settled deposit for Case #${disputeId}`);
        onClose();
    };

    return (
        <div className="p-6 space-y-4">
            <p className="text-gray-700">
                You are about to <span className="font-bold text-red-500">release the full security deposit</span> for the rental of <span className="font-bold">{item.title}</span> back to the borrower.
                This action confirms there is <span className="font-bold text-red-500">no damage</span> and will close the case.
            </p>
            <p className="text-sm font-semibold text-green-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" /> Deposit will be returned, and the case will be settled.
            </p>

            <div className="flex justify-center pt-4 border-t">
                <button onClick={onClose} className="mr-3 text-gray-600 bg-gray-300 hover:text-gray-800">Cancel</button>
                <button
                    onClick={(event) => handleSettle(event)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    Confirm & Settle Deposit
                </button>
            </div>
        </div>
    );
}