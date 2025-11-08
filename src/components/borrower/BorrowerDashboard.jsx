import {Package, Zap} from 'lucide-react';
import {RENTAL_STATUS} from "../util/Util.js";

export default function BorrowerDashboard ({ authenticatedUser, appData }) {
    const listings = appData.listings;
    const requests = appData.requests.filter(req => req.borrowerId === authenticatedUser.id);
    const borrowerRentals = appData.rentals.filter(rental => (requests.map(req => req.id)).includes(rental.requestId));
    const activeRentals = borrowerRentals.filter(rental => rental.status === RENTAL_STATUS.ACTIVE);
    const pastRentals = borrowerRentals.filter(rental => rental.status === RENTAL_STATUS.COMPLETED);

    return (
        <div className="py-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Borrower History: Your Rentals</h3>

            <div className="space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-indigo-500"/>
                        Active Rentals ({activeRentals.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.requestId);
                            const item = listings.find(listing => listing.id === correspondingRequest.listingId);

                            return (
                                <div key={rental.id}
                                     className="p-4 border border-indigo-200 rounded-xl flex justify-between items-center bg-indigo-50">
                                    <div className="flex items-center space-x-3">
                                        <img src={item.imageUrl} alt={item.title}
                                             className="w-10 h-10 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-600">Due: <span
                                                className="font-bold">{rental.returnDate}</span></p>
                                        </div>
                                    </div>
                                    <button
                                        className="text-sm text-white bg-red-600 px-3 py-1 rounded-lg hover:bg-red-700 transition">
                                        Return Item
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Past Rentals Section */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                        <Package className="w-6 h-6 mr-2 text-green-500"/>
                        Past Rentals ({pastRentals.length})
                    </h4>
                    <div className="space-y-4">
                        {pastRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.requestId);
                            const item = listings.find(listing => listing.id === correspondingRequest.listingId);

                            return (
                                <div key={rental.id}
                                     className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.title}</p>
                                        <p className="text-sm text-gray-500">Returned: {rental.returnDate}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}