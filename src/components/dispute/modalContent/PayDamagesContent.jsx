import React from 'react';
import {apiRequest, DISPUTE_STATUS} from "../../util/Util.js";

export default function PayDamagesContent ({ disputeData, onClose, setAppData }) {
    const payDamages = async (dispute) => {
        const disputeId = dispute.id;
        const damageAmount = dispute.damage_amount;

        const {data: updatedDispute, error} = await apiRequest(
            '/api/payDamages',
            {
                method: 'POST',
                body: {
                    disputeId: disputeId,
                    damageAmount: damageAmount,
                    disputeResolutionStatus: DISPUTE_STATUS.COMPLETED
                }
            }
        );

        if (error) {
            console.error("Error finalizing damage payment:", error);
            alert(`Failed to confirm payment: ${error.message}`);
            return;
        }

        setAppData(prevData => {
            const updatedDisputes = prevData.disputes.map(d =>
                d.id === disputeId ? updatedDispute : d
            );
            return { ...prevData, disputes: updatedDisputes };
        });

        console.log(`CONFIRMED ACTION: Damages paid and Case #${disputeId} closed.`);
        onClose();
    };

    return (
        <div className="p-6 space-y-4">
            <p className="text-gray-700">
                The platform has ruled in favor of the merchant. Pay the required damages for **{disputeData.item.title}** to close the case.
            </p>
            <div className="text-lg font-bold text-red-600">Damage Amount Due: {disputeData.damage_amount}</div>

            <p className="text-sm text-gray-500">
                *Note: Payment will release the deposit hold and clear your account for future rentals.*
            </p>

            <div className="flex justify-end pt-4 border-t">
                <button onClick={onClose} className="mr-3 text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                    onClick={() => payDamages(disputeData)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    Confirm Payment
                </button>
            </div>
        </div>
    )
}