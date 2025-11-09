import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Package, ShieldAlert } from 'lucide-react';
import { DISPUTE_STATUS, RENTAL_STATUS } from "../util/Util.js";

// --- Helper Functions for Data Display ---

const getDisputeDisplay = (dispute) => {
    if (!dispute || dispute.status === DISPUTE_STATUS.COMPLETED) {
        return { label: 'Settled', color: 'bg-green-100 text-green-700' };
    }

    // Statuses that require attention or are unsettled
    switch (dispute.status) {
        case DISPUTE_STATUS.PENDING_DEPOSIT_RETURN:
            return { label: 'Awaiting Lender Review', color: 'bg-yellow-100 text-yellow-700' };
        case DISPUTE_STATUS.ACTIVE:
            return { label: 'Lender Claim Filed', color: 'bg-red-100 text-red-700' };
        default:
            return { label: dispute.status, color: 'bg-gray-100 text-gray-700' };
    }
};

export default function BorrowerDashboard({ authenticatedUser, appData, setAppData }) {
    const navigate = useNavigate(); // Initialize useNavigate hook

    const listings = appData.listings;
    const allDisputes = appData.disputes;

    // 1. Filter relevant data
    const requests = appData.requests.filter(req => req.borrowerId === authenticatedUser.id);
    const borrowerRentals = appData.rentals.filter(rental => (requests.map(req => req.id)).includes(rental.requestId));

    // --- Core Filtering Logic for 3 Sections ---

    // Rentals still physically out
    const activeRentals = borrowerRentals.filter(rental => rental.status === RENTAL_STATUS.ACTIVE);

    // Rentals returned (COMPLETED) but with an UNSETTLED dispute (status is NOT COMPLETED)
    const disputedRentals = borrowerRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.COMPLETED) return false;

        const dispute = allDisputes.find(d => d.rentalId === rental.id);
        return dispute && dispute.status !== DISPUTE_STATUS.COMPLETED;
    });

    // Rentals where the rental status is COMPLETED AND the dispute status is COMPLETED (or no dispute exists)
    const pastRentals = borrowerRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.COMPLETED) return false;

        const dispute = allDisputes.find(d => d.rentalId === rental.id);
        return !dispute || dispute.status === DISPUTE_STATUS.COMPLETED;
    });

    // --- Handlers ---

    // Corrected handler for item return
    const handleReturn = function (rental, event) {
        event.preventDefault();

        const returnDate = Date.now();
        const newDisputeId = Date.now();

        // 1. Prepare updated Rental object
        const updatedRental = {
            ...rental,
            returnDate: returnDate,
            status: RENTAL_STATUS.COMPLETED,
            disputeId: newDisputeId
        };

        // 2. Prepare new Dispute object (starts immediately upon return for review)
        const newDispute = {
            id: newDisputeId,
            rentalId: rental.id,
            startDate: returnDate,
            endDate: null,
            // Start the process at PENDING_DEPOSIT_RETURN for lender review
            status: DISPUTE_STATUS.PENDING_DEPOSIT_RETURN
        }

        setAppData(prevData => {
            // Immutable update for Rental: Replace the old object
            const updatedRentals = prevData.rentals.map(r =>
                r.id === rental.id ? updatedRental : r
            );

            // Immutable update for Disputes: Add the new dispute object
            const updatedDisputes = [...prevData.disputes, newDispute];

            return { ...prevData, rentals: updatedRentals, disputes: updatedDisputes };
        });

        // 3. Navigate to the Dispute Dashboard so the borrower can see the new status
        navigate('/disputes');
    }

    // Handler to navigate to the disputes tab/page
    const handleViewDispute = function (rentalId) {
        // You can pass the rental ID or dispute ID if needed to pre-select the case
        navigate(`/disputes?rentalId=${rentalId}`);
    }

    // --- Render Logic ---
    return (
        <div className="py-8 max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-8">Borrower History: Your Rentals</h3>

            <div className="space-y-10">
                {/* 1. Active Rentals (Physically Out) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <Zap className="w-7 h-7 mr-2 text-indigo-500"/>
                        Active Rentals ({activeRentals.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.requestId);
                            const item = listings.find(listing => listing.id === correspondingRequest.listingId);

                            return (
                                <div key={rental.id}
                                     className={`p-4 border border-indigo-200 bg-indigo-50 rounded-xl flex flex-col justify-between space-y-3`}>
                                    <div className="flex items-center space-x-3">
                                        <img src={item.imageUrl} alt={item.title}
                                             className="w-12 h-12 rounded-lg object-cover border"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-600">Due: <span
                                                className="font-bold">{correspondingRequest.rentEndDate}</span></p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(event) => handleReturn(rental, event)}
                                        className="text-sm text-white bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition font-medium w-full">
                                        Pay & Return Item Now
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* --- */}

                {/* 2. Disputed Rentals (Returned but Unsettled) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <ShieldAlert className="w-7 h-7 mr-2 text-red-500"/>
                        Disputed Rentals ({disputedRentals.length})
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Immediate action may be required on the Disputes tab.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {disputedRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.requestId);
                            const item = listings.find(listing => listing.id === correspondingRequest.listingId);
                            const dispute = allDisputes.find(d => d.rentalId === rental.id);
                            const display = getDisputeDisplay(dispute);

                            return (
                                <div key={rental.id}
                                     className={`p-4 border border-red-300 bg-red-50 rounded-xl flex flex-col justify-between space-y-3`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <img src={item.imageUrl} alt={item.title}
                                                 className="w-12 h-12 rounded-lg object-cover border"/>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.title}</p>
                                                <p className="text-sm text-gray-600">Returned: <span
                                                    className="font-bold">{new Date(rental.returnDate).toLocaleDateString()}</span></p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${display.color}`}>
                                            {display.label}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleViewDispute(rental.id)}
                                        className="text-sm text-white bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition font-medium w-full">
                                        Go to Disputes Tab
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* --- */}

                {/* 3. Past Rentals (Settled) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <Package className="w-7 h-7 mr-2 text-green-500"/>
                        Past Rentals (Settled) ({pastRentals.length})
                    </h4>
                    <div className="space-y-4">
                        {pastRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.requestId);
                            const item = listings.find(listing => listing.id === correspondingRequest.listingId);
                            const dispute = allDisputes.find(d => d.rentalId === rental.id);
                            const display = getDisputeDisplay(dispute);

                            return (
                                <div key={rental.id}
                                     className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition rounded-lg">
                                    <div className='flex space-x-4 items-center'>
                                        <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">Returned: {new Date(rental.returnDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${display.color}`}>
                                            {display.label}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}