export default function ViewStatusContent ({ dispute, onClose }) {
    return (
        <div className="p-6 space-y-4">
            <h4 className="text-lg font-bold text-gray-800 flex items-center">
                Current Status: Awaiting Lender Review
            </h4>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm space-y-2">
                <p className="font-semibold flex items-center">
                    <Shield className="w-4 h-4 mr-2"/>
                    Your security deposit is currently held.
                </p>
                <p className="text-gray-700">The Lender has **{/* Example: 18 hours */}** left to inspect the item and either release the deposit or file a damage claim.</p>
                <p className="text-sm text-gray-500">You do not need to take any action at this time.</p>
            </div>
            <div className="flex justify-end pt-4 border-t">
                <button onClick={onClose} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Close</button>
            </div>
        </div>
    )
}