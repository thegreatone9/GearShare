import {Package, Zap} from 'lucide-react';
import {DISPUTE_STATUS, RENTAL_STATUS} from "../util/Util.js";

export default function BorrowerDashboard ({ authenticatedUser, appData, setAppData }) {
    const listings = appData.listings;
    const requests = appData.requests.filter(req => req.borrowerId === authenticatedUser.id);
    const borrowerRentals = appData.rentals.filter(rental => (requests.map(req => req.id)).includes(rental.requestId));
    const activeRentals = borrowerRentals.filter(rental => rental.status === RENTAL_STATUS.ACTIVE);
    const pastRentals = borrowerRentals.filter(rental => RENTAL_STATUS.COMPLETED === rental.status);
    const disputes = appData.disputes.filter(dispute => (borrowerRentals.map(borrowerRental => borrowerRental.id)).includes(dispute.rentalId));

    const handleReturn = function (rental, event) {
        event.preventDefault();

        rental.returnDate = Date.now();
        rental.status = RENTAL_STATUS.COMPLETED;

        const dispute = {
            id: Date.now(),
            rentalId: rental.id,
            startDate: rental.returnDate,
            endDate: null,
            status: DISPUTE_STATUS.ACTIVE
        }

        setAppData(prevData => {
            const updatedRentals = prevData.rentals.filter(existingRental =>
                rental.id !== existingRental.id
            );
            updatedRentals.add(rental);

            const updateDisputes = prevData.disputes;
            updateDisputes.add(dispute);

            return { ...prevData, rentals: updatedRentals, disputes: updateDisputes };
        });
    }

    const handleDepositClaim = function (dispute, event) {
        event.preventDefault();

        dispute.status = DISPUTE_STATUS.COMPLETED;

        setAppData(prevData => {
            const updateDisputes = prevData.disputes;
            updateDisputes.add(dispute);

            return { ...prevData, disputes: updateDisputes };
        });
    }

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
                                    <div className="flex items-center space-x-3 px-2">
                                        <img src={item.imageUrl} alt={item.title}
                                             className="w-10 h-10 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-600">Due: <span
                                                className="font-bold">{correspondingRequest.rentEndDate}</span></p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(event) => handleReturn(rental, event)}
                                        className="text-sm text-white bg-red-600 px-3 py-1 rounded-lg hover:bg-red-700 transition">
                                        Pay & Return
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Past Rentals Section */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center">
                        <Package className="w-6 h-6 mr-2 text-green-500"/>
                        Past Rentals ({pastRentals.length})
                    </h4>
                    <div className="space-y-4">
                        {pastRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.requestId);
                            const item = listings.find(listing => listing.id === correspondingRequest.listingId);
                            const dispute = disputes.find(dispute => dispute.rentalId === rental.id);

                            return (
                                <div key={rental.id}
                                     className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.title}</p>
                                        <p className="text-sm text-gray-500">Returned: {correspondingRequest.rentEndDate}</p>
                                        <p className="text-sm text-gray-500">Dispute Status: {dispute.status}</p>
                                    </div>
                                    {
                                        dispute.status === DISPUTE_STATUS.PENDING_DEPOSIT_RETURN &&
                                        <button
                                            onClick={(event) => handleDepositClaim(dispute, event)}
                                            className="text-sm text-white bg-red-600 px-3 py-1 rounded-lg hover:bg-red-700 transition">
                                            Resolve Dispute & Deposit
                                        </button>
                                    }
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}