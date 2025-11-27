export default function ViewClaimDetailsContent ({ disputeData, onClose }) {
    return (
        <div className="p-6 space-y-4">
            <h4 className="text-lg font-bold text-indigo-700 flex items-center">
                Claim Filed by Lender (Case #{disputeData.id})
            </h4>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm space-y-2 max-h-96 overflow-y-auto">
                <p className="font-semibold">Description:</p>
                <p className="text-gray-700">The item was returned with significant cosmetic damage on the main housing, inconsistent with normal wear and tear.</p>
                <p className="font-semibold mt-3">Requested Resolution:</p>
                <p className="text-gray-700">Full replacement cost of $800 (or deposit retention).</p>
                <p className="font-semibold mt-3">Evidence Attached:</p>
                <ul className="list-disc list-inside text-gray-700">
                    <li>Photo 1: Cracked casing.</li>
                    <li>Video 1: Item inspection upon return.</li>
                </ul>
            </div>
            <div className="flex justify-end pt-4 border-t">
                <button onClick={onClose} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Close</button>
            </div>
        </div>
    )
}