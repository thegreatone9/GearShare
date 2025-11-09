import { Clock, Package, Wrench, Zap, ShieldAlert, CheckCheck, Landmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RENTAL_STATUS, DISPUTE_STATUS } from "../util/Util.js";
import Modal from "../common/Modal.jsx";
import AcceptRentalRequest from "./AcceptRentalRequest.jsx";
import { useState } from "react";

// --- Helper Functions for Data Display ---

const getDisputeDisplay = (dispute) => {
    if (!dispute || dispute.status === DISPUTE_STATUS.COMPLETED) {
        return { label: 'Settled', color: 'bg-green-100 text-green-700' };
    }

    switch (dispute.status) {
        case DISPUTE_STATUS.PENDING_DEPOSIT_RETURN:
            return { label: 'Awaiting Your Review', color: 'bg-red-100 text-red-700' };
        case DISPUTE_STATUS.ACTIVE:
            return { label: 'Awaiting Borrower Evidence', color: 'bg-blue-100 text-blue-700' };
        default:
            return { label: dispute.status, color: 'bg-gray-100 text-gray-700' };
    }
};

// --- Component Definition ---

export default function LenderDashboard({ authenticatedUser, appData, setAppData }) {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const { disputes } = appData;

    const listings = appData.listings.filter(listing => listing.ownerId === authenticatedUser.id);
    const requests = appData.requests.filter(req => req.lenderId === authenticatedUser.id);
    const lenderRentals = appData.rentals.filter(rental => (requests.map(req => req.id)).includes(rental.requestId));

    // Rentals that are physically OUT
    const activeRentals = lenderRentals.filter(rental => rental.status === RENTAL_STATUS.ACTIVE);

    // Listings not currently rented
    const pendingRentalListings = listings.filter(item => !activeRentals.map(aR => aR.listingId).includes(item.id));

    // IV. Disputed Rentals (Returned but UNSETTLED)
    const disputedRentals = lenderRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.COMPLETED) return false;

        const dispute = disputes.find(d => d.rentalId === rental.id);
        return dispute && dispute.status !== DISPUTE_STATUS.COMPLETED;
    });

    // V. Past Rentals (Settled)
    const pastRentals = lenderRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.COMPLETED) return false;

        const dispute = disputes.find(d => d.rentalId === rental.id);
        return !dispute || dispute.status === DISPUTE_STATUS.COMPLETED;
    });

    // --- Handlers ---

    const editItem = function (itemId, itemStatus) {
        navigate(`/lender/item/${itemId}?status=${itemStatus}`);
    }

    const handleViewDisputes = function() {
        navigate('/disputes');
    }

    const openAcceptModal = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const confirmAcceptance = () => {
        if (!selectedRequest) return;

        const { reqId, listingId, borrowerId, lenderId } = selectedRequest;

        setAppData(prevData => {
            const updatedRequests = prevData.requests.filter(req => req.id !== reqId);

            const newRental = {
                id: Date.now(),
                requestId: reqId,
                listingId,
                borrowerId,
                lenderId,
                returnDate: null,
                status: RENTAL_STATUS.ACTIVE
            };

            const updatedListings = prevData.listings.map(item =>
                item.id === listingId
                    ? { ...item, listingStatus: RENTAL_STATUS.ACTIVE }
                    : item
            );

            return {
                ...prevData,
                requests: updatedRequests,
                rentals: [...prevData.rentals, newRental],
                listings: updatedListings,
            };
        });

        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const declineRequest = (request) => {
        setAppData(prevData => {
            const updatedRequests = prevData.requests.filter(req => req.id !== request.id);
            return { ...prevData, requests: updatedRequests };
        })
    }

    const modalItem = selectedRequest ? listings.find(listing => listing.id === selectedRequest.listingId) : null;
    const modalBorrower = selectedRequest ? appData.accounts.find(acc => acc.id === selectedRequest.borrowerId) : null;

    // --- Render Logic ---

    return (
        <div className="py-8 max-w-5xl mx-auto">
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Review Rental Confirmation"
                maxWidth="max-w-lg"
            >
                <AcceptRentalRequest
                    request={selectedRequest}
                    item={modalItem}
                    borrower={modalBorrower}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={confirmAcceptance}
                />
            </Modal>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-gray-800">Lender Hub: Manage Inventory & Requests</h3>
                <Link to="/lender/item"
                      className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-100 transition">
                    <Package className="w-4 h-4 inline mr-1"/>
                    New Item
                </Link>
            </div>

            {/* MAIN CONTAINER: Use a single column grid to stack all sections vertically */}
            <div className="grid grid-cols-1 gap-8">

                {/* I. Active Rentals */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <Zap className="w-7 h-7 mr-2 text-indigo-500"/>
                        Active Rentals ({activeRentals.length})
                    </h4>

                    {/* *** FIX: Changed grid layout below to a simple vertical stack (space-y-3) *** */}
                    <div className="space-y-4">
                        {activeRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.requestId);
                            const item = listings.find(listing => listing.id === correspondingRequest.listingId);

                            // Formatting the date for a cleaner look
                            const returnDate = correspondingRequest?.rentEndDate
                                ? correspondingRequest.rentEndDate // Use original mock format if needed
                                : 'N/A';

                            return (
                                <div key={rental.id}
                                    // IMPROVEMENT: Ensure item card takes full width and uses flex for internal alignment
                                     className="p-4 border border-indigo-200 rounded-xl flex justify-between items-center bg-indigo-50 hover:bg-indigo-100 transition w-full">

                                    {/* Item Details (Left Side) */}
                                    <div className="flex items-center space-x-4">
                                        <img src={item.imageUrl} alt={item.title}
                                             className="w-14 h-14 rounded-lg object-cover border border-indigo-300"/>
                                        <div>
                                            <p className="font-medium text-lg text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-600">Due: <span
                                                className="font-bold text-indigo-700">{returnDate}</span></p>
                                        </div>
                                    </div>

                                    {/* Status and Action (Right Side) */}
                                    <div className="text-right flex flex-col items-end">
                                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 shadow-sm`}>
                                          **Rented**
                                        </span>
                                        <button className="text-sm text-indigo-600 mt-2 hover:text-indigo-800 font-medium"
                                                onClick={() => editItem(item.id, RENTAL_STATUS.ACTIVE)}>
                                            Manage Item
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {activeRentals.length === 0 && (
                        <p className="text-center text-sm text-gray-500 py-4 border rounded-lg">No items are currently out on rent.</p>
                    )}
                </div>

                {/* II. Pending Borrower Requests (High-Priority Action) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <Clock className="w-7 h-7 mr-2 text-yellow-500"/>
                        Pending Requests ({requests.length})
                    </h4>
                    <div className="space-y-4">
                        {requests.map(req => {
                                const item = listings.find(listing => listing.id === req.listingId);

                                return (
                                    <div key={req.id}
                                         className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl shadow-inner">
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                            <span className="font-bold text-gray-900">Borrower</span> wants
                                            to rent <span className="text-indigo-600 font-bold">{item?.title || 'Unknown Item'}</span>.
                                        </p>
                                        <p className="text-xs text-gray-600 mb-3">
                                            Duration: {req.duration || 'N/A'} | Deposit: ${req.deposit || 'N/A'}
                                        </p>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => declineRequest(req)}
                                                className="text-xs font-semibold text-red-600 bg-white border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50 transition">
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => openAcceptModal(req)}
                                                className="text-xs font-semibold text-white bg-green-600 px-3 py-1 rounded-lg hover:bg-green-700 transition">
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                )
                            }
                        )}
                        {requests.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-4">No pending requests right now.</p>
                        )}
                    </div>
                </div>

                {/* III. Pending Rental Listings (Inventory) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center justify-between">
                        <span className="flex items-center">
                          <Wrench className="w-7 h-7 mr-2 text-indigo-500"/>
                            Available Inventory ({pendingRentalListings.length})
                        </span>
                    </h4>
                    <div className="space-y-4">
                        {pendingRentalListings.map(item => {
                            return (
                                <div key={item.id}
                                     className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                    <div className="flex items-center space-x-3">
                                        <img src={item.imageUrl} alt={item.title}
                                             className="w-12 h-12 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">Rent: ${item.price}/day</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                            item.status === 'Rented' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                          {item.status}
                                        </span>
                                        {item.nextReturn &&
                                            <p className="text-xs text-gray-500 mt-1">Returns: {item.nextReturn}</p>}
                                        <button className="text-xs text-indigo-600 mt-1 hover:underline"
                                                onClick={() => editItem(item.id, RENTAL_STATUS.PENDING_BORROW)}>Manage
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* IV. Disputed Rentals */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <ShieldAlert className="w-7 h-7 mr-2 text-red-500"/>
                        Disputed Rentals ({disputedRentals.length})
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Immediate action may be required to resolve the deposit claim.</p>
                    {disputedRentals.length > 0 && (
                        <button
                            onClick={handleViewDisputes}
                            className="text-sm text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium mb-4 w-full flex items-center justify-center">
                            <Landmark className='w-4 h-4 mr-2'/>
                            Go to Disputes Dashboard
                        </button>
                    )}
                    <div className="space-y-4">
                        {disputedRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.requestId);
                            const item = listings.find(listing => listing.id === correspondingRequest.listingId);
                            const dispute = disputes.find(d => d.rentalId === rental.id);
                            const display = getDisputeDisplay(dispute);

                            return (
                                <div key={rental.id}
                                     className="flex justify-between items-center p-3 border border-red-300 bg-red-50 rounded-lg">
                                    <div className='flex space-x-4 items-center'>
                                        <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">Returned: {new Date(rental.returnDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${display.color}`}>
                                        {display.label}
                                    </span>
                                </div>
                            )
                        })}
                        {disputedRentals.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-4 border rounded-lg">No pending deposit issues.</p>
                        )}
                    </div>
                </div>

                {/* V. Past Rentals (Settled) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <CheckCheck className="w-7 h-7 mr-2 text-green-500"/>
                        Past Rentals (Settled) ({pastRentals.length})
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Items that have been returned and the deposit has been released or claimed.</p>
                    <div className="space-y-4">
                        {pastRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.requestId);
                            const item = listings.find(listing => listing.id === correspondingRequest.listingId);
                            const dispute = disputes.find(d => d.rentalId === rental.id);
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
                        {pastRentals.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-4">No settled rentals yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}