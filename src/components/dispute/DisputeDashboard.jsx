import {MessageSquareWarning, Shield} from 'lucide-react';

export default function DisputeDashboard({ authenticatedUser, disputes }) {
    return (
        <div className="py-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex justify-between items-center">
                Dispute Center: Resolution Status
                <span className="text-sm font-medium text-gray-500 flex items-center">
        <Shield className="w-4 h-4 mr-1"/>
        Deposits are held during review
      </span>
            </h3>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Your Open & Recent Cases
                    ({disputes.length})</h4>
                <div className="space-y-4">
                    {disputes.map(dispute => (
                        <div key={dispute.dispId}
                             className="p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:bg-gray-50 transition">
                            <div className="flex-grow">
                                <p className="font-medium text-gray-900">Case #{dispute.dispId}: {dispute.itemTitle}</p>
                                <p className="text-sm text-gray-600 mt-0.5">Role: <span
                                    className="font-semibold">{dispute.role}</span></p>
                            </div>
                            <div className="mt-2 sm:mt-0 text-left sm:text-right">
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  dispute.status.includes('Resolution Issued') ? 'bg-green-100 text-green-700' :
                      dispute.status.includes('Evidence') ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              } shadow-sm`}>
                {dispute.status}
              </span>
                                {dispute.status.includes('Evidence') && (
                                    <button
                                        className="ml-3 text-xs text-white bg-red-600 px-3 py-1 rounded-lg hover:bg-red-700 transition flex items-center">
                                        <MessageSquareWarning className="w-4 h-4 mr-1"/>
                                        Action Required
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}