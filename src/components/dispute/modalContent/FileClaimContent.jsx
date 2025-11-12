import React, {useState} from 'react';
import {DISPUTE_STATUS} from "../../util/Util.js";

export default function FileClaimContent({ dispute, onClose, setAppData }) {
    const [damageDescription, setDamageDescription] = useState('');

    const isFormValid = damageDescription.length > 10;

    const handleConfirm = () => {
        if (isFormValid) {
            handleFileClaim(dispute.id);

        } else {
            alert("Please provide a detailed description of the damage.");
        }
    };

    const handleFileClaim = function (disputeId) {
        setAppData(prevData => {
            const updatedDisputes = prevData.disputes.map(d =>
                d.id === disputeId
                    ? { ...d, status: DISPUTE_STATUS.ACTIVE, endDate: Date.now() }
                    : d
            );
            return { ...prevData, disputes: updatedDisputes };
        });
        console.log(`CONFIRMED ACTION: Lender filed claim for Case #${disputeId}`);
        onClose();
    }

    return (
        <div className="p-6 space-y-4">
            <p className="text-gray-700">
                Filing a claim **retains the security deposit** for **{dispute.itemTitle}**. You must provide evidence below to proceed.
            </p>

            <label htmlFor="damage-description" className="block text-sm font-medium text-gray-700">
                Describe the Damage (Required)
            </label>
            <textarea
                id="damage-description"
                rows="3"
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                placeholder="E.g., The lens glass has a significant scratch not present at pickup."
                className="w-full p-2 border border-red-300 rounded-lg focus:ring-red-500"
            ></textarea>

            <label htmlFor="evidence-upload" className="block text-sm font-medium text-gray-700">
                Upload Photos/Videos
            </label>
            <input type="file" id="evidence-upload" multiple className="w-full text-sm text-gray-500" />

            <div className="flex justify-end pt-4 border-t">
                <button onClick={onClose} className="mr-3 text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                    onClick={handleConfirm}
                    disabled={!isFormValid}
                    className={`text-white px-4 py-2 rounded-lg transition font-medium ${isFormValid ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    File Claim & Submit Evidence
                </button>
            </div>
        </div>
    );
}