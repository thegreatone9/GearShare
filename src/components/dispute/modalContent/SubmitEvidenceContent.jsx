import React, {useState} from 'react';
import {supabase} from "../../../server/supabaseClient.js";
import {DISPUTE_STATUS} from "../../util/Util.js";

export default function SubmitEvidenceContent ({ disputeData, onClose, setAppData }) {
    const [defenseDescription, setDefenseDescription] = useState('');

    const submitEvidence = async (disputeId, description) => {
        // 1. Prepare data for update
        const updateData = {
            // We use the same 'active' status but add metadata (optional columns)
            status: DISPUTE_STATUS.BORROWER_EVIDENCE_SUBMITTED,
            borrower_defense_description: description // Assuming a column for defense description
            // If you had a status for 'Evidence Submitted', you would set it here:
            // status: DISPUTE_STATUS.PENDING_ADMIN_REVIEW
        };

        // 2. Update the dispute record in the database
        const { data: updatedDispute, error } = await supabase
            .from('disputes')
            .update(updateData)
            .eq('id', disputeId)
            .select()
            .single();

        if (error) {
            console.error("Error submitting evidence:", error);
            alert(`Failed to submit evidence: ${error.message}`);
            return;
        }

        // 3. Sync local appData immutably
        setAppData(prevData => {
            const updatedDisputes = prevData.disputes.map(d =>
                d.id === disputeId ? updatedDispute : d
            );
            return { ...prevData, disputes: updatedDisputes };
        });

        console.log(`CONFIRMED ACTION: Borrower submitted evidence for Case #${disputeId}`);
        onClose();
    };

    const handleConfirm = () => {
        if (defenseDescription.length > 10) {
            submitEvidence(disputeData.id, defenseDescription);

        } else {
            alert("Please provide a detailed defense statement (minimum 10 characters).");
        }
    };

    return (
        <div className="p-6 space-y-4">
            <p className="text-gray-700">
                The lender has filed a claim. Upload evidence below to dispute the damage claim for **{disputeData.item.title}**.
            </p>
            <label htmlFor="defense-description" className="block text-sm font-medium text-gray-700">
                Your Defense Statement
            </label>
            <textarea
                id="defense-description"
                rows="3"
                value={defenseDescription}
                onChange={(e) => setDefenseDescription(e.target.value)}
                className="w-full p-2 border border-indigo-300 rounded-lg focus:ring-indigo-500"
            ></textarea>

            <label htmlFor="evidence-upload" className="block text-sm font-medium text-gray-700">
                Upload Counter-Evidence (e.g., return photos)
            </label>
            <input type="file" id="evidence-upload" multiple className="w-full text-sm text-gray-500" />

            <div className="flex justify-end pt-4 border-t">
                <button onClick={onClose} className="mr-3 text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                    onClick={handleConfirm}
                    disabled={defenseDescription.length <= 10}
                    className={`bg-red-600 text-white px-4 py-2 rounded-lg transition font-medium ${defenseDescription.length > 10 ? 'hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    Submit Defense
                </button>
            </div>
        </div>
    );
}