export default function PayDamagesContent ({ dispute, onClose }) {
    const payDamages = (disputeId) => console.log(`ACTION: Pay Damages for Case #${disputeId}`);

    return (
        <div className="p-6 space-y-4">
            <p className="text-gray-700">
                The platform has ruled in favor of the lender. Pay the required damages for **{dispute.itemTitle}** to close the case.
            </p>
            <div className="text-lg font-bold text-red-600">Damage Amount Due: $XXX.XX</div>

            <p className="text-sm text-gray-500">
                *Note: Payment will release the deposit hold and clear your account for future rentals.*
            </p>

            <div className="flex justify-end pt-4 border-t">
                <button onClick={onClose} className="mr-3 text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                    onClick={() => payDamages(dispute.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    Confirm Payment
                </button>
            </div>
        </div>
    )
}