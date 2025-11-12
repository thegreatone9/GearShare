import React from 'react';
import {DollarSign} from 'lucide-react';
import {DISPUTE_STATUS} from "../util/Util.js";

export default function SettleContent({ dispute, onClose }) {
    const handleSettle = (disputeId) => {
        setAppData(prevData => {
            const updatedDisputes = prevData.disputes.map(d =>
                d.id === disputeId
                    ? { ...d, status: DISPUTE_STATUS.COMPLETED }
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
                You are about to **release the full security deposit** for the rental of **{dispute.itemTitle}** back to the borrower.
                This action confirms there is **no damage** and will close the case.
            </p>
            <p className="text-sm font-semibold text-green-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" /> Deposit will be returned, and the case will be settled.
            </p>

            <div className="flex justify-end pt-4 border-t">
                <button onClick={onClose} className="mr-3 text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                    onClick={() => handleSettle(dispute.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    Confirm & Settle Deposit
                </button>
            </div>
        </div>
    );
}