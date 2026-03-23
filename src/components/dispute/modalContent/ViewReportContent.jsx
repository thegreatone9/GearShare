export default function ViewReportContent ({ disputeData, onClose }) {
    return (
        <div className="p-6 space-y-4">
            <h4 className="text-lg font-bold text-green-700 flex items-center">
                Final Settlement Report (Case #{disputeData.dispute.id})
            </h4>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm space-y-2 max-h-96 overflow-y-auto">
                <p className="font-semibold">Platform Ruling Date:</p>
                <p>October 25, 2025</p>
                <p className="font-semibold mt-3">Final Decision:</p>
                <p className="text-lg font-bold text-green-700">Client found non-liable for damage.</p>
                <p className="font-semibold mt-3">Deposit Payout:</p>
                <p>Full Deposit ($150.00) returned to Client.</p>
                <p className="font-semibold mt-3">Case Status:</p>
                <p>Closed (Dispute Status: COMPLETED)</p>
            </div>
            <div className="flex justify-end pt-4 border-t">
                <button onClick={onClose} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Close</button>
            </div>
        </div>
    )
}