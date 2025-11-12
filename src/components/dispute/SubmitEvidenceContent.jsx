export default function SubmitEvidenceContent ({ dispute, onClose }) {
    const submitEvidence = (disputeId) => console.log(`ACTION: Submit Counter-evidence for Case #${disputeId}`);

    return (
        <div className="p-6 space-y-4">
            <p className="text-gray-700">
                The lender has filed a claim. Upload evidence below to dispute the damage claim for **{dispute.itemTitle}**.
            </p>
            <label htmlFor="defense-description" className="block text-sm font-medium text-gray-700">
                Your Defense Statement
            </label>
            <textarea id="defense-description" rows="3" className="w-full p-2 border border-indigo-300 rounded-lg focus:ring-indigo-500"></textarea>

            <label htmlFor="evidence-upload" className="block text-sm font-medium text-gray-700">
                Upload Counter-Evidence (e.g., return photos)
            </label>
            <input type="file" id="evidence-upload" multiple className="w-full text-sm text-gray-500" />

            <div className="flex justify-end pt-4 border-t">
                <button onClick={onClose} className="mr-3 text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                    onClick={() => submitEvidence(dispute.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                    Submit Defense
                </button>
            </div>
        </div>
    );
}