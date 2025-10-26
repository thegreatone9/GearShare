import {Clock, Package, Wrench, Zap} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import {RENTAL_STATUS} from "../util/Util.js";
import Modal from "../common/Modal.jsx";
import AcceptRentalRequest from "./AcceptRentalRequest.jsx";
import {useState} from "react";

export default function LenderDashboard({authenticatedUser, appData, setAppData}) {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const listings = appData.listings.filter(listing => listing.ownerId === authenticatedUser.id);
    const requests = appData.requests.filter(pendingReq => pendingReq.lenderId === authenticatedUser.id);
    const activeRentals = appData.activeRentals.filter(activeRental => activeRental.lenderId === authenticatedUser.id);
    const pendingRentalListings = listings.filter(item => !activeRentals.map(aR => aR.listingId).includes(item.id));

    const editItem = function (itemId, itemStatus) {
        navigate(`/lender/item/${itemId}?status=${itemStatus}`);
    }

    const openAcceptModal = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const confirmAcceptance = () => {
        if (!selectedRequest) return;

        const { reqId, listingId, borrowerId, lenderId } = selectedRequest;

        setAppData(prevData => {
            // 1. Remove the request from requests
            const updatedPending = prevData.requests.filter(req => req.reqId !== reqId);

            // 2. Create a new activeRental entry
            const newRental = {
                rentalId: Date.now(),
                listingId,
                borrowerId,
                lenderId,
                dueDate: "Nov 3 (New)",
                status: RENTAL_STATUS.ACTIVE
            };

            const updatedListings = prevData.listings.map(item =>
                item.id === listingId
                    ? { ...item, listingStatus: RENTAL_STATUS.ACTIVE } // Set listing status to ACTIVE
                    : item
            );

            return {
                ...prevData,
                requests: updatedPending,
                activeRentals: [...prevData.activeRentals, newRental],
                listings: updatedListings,
            };
        });

        setIsModalOpen(false);
        setSelectedRequest(null);

        console.log(`Request ${reqId} confirmed and moved to active rentals.`);
    };

    const declineRequest = (request) => {
        setAppData(prevData => {
            const updatedPending = prevData.requests.filter(req => req.reqId !== request.reqId);

            return {
                ...prevData,
                requests: updatedPending
            };
        })
    }

    const modalItem = selectedRequest ? listings.find(listing => listing.id === selectedRequest.listingId) : null;
    const modalBorrower = selectedRequest ? appData.accounts.find(acc => acc.id === selectedRequest.borrowerId) : null;

    return (
        <div className="py-8">
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
                <h3 className="2xl font-bold text-gray-800">Lender Hub: Manage Inventory & Requests</h3>
                {/* Link to New Item Form */}
                <Link to="/lender/item"
                      className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-100 transition">
                    <Package className="w-4 h-4 inline mr-1"/>
                    New Item
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-indigo-500"/>
                        Active Rentals ({activeRentals.length})
                    </h4>
                    <div className="space-y-4">
                        {activeRentals.map(rental => {
                            const item = listings.find(listing => listing.id === rental.listingId);

                            return (
                                <div key={rental.rentalId}
                                     className="p-4 border border-indigo-200 rounded-xl flex justify-between items-center bg-indigo-50">
                                    <div className="flex items-center space-x-3">
                                        <img src={item.imageUrl} alt={item.title}
                                             className="w-10 h-10 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-600">Due: <span
                                                className="font-bold">{rental.dueDate}</span></p>
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
                                                onClick={() => editItem(item.id, RENTAL_STATUS.ACTIVE)}>Manage
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Column 1: My Current Listings & New Item CTA */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 order-1 lg:order-1">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
                        <span className="flex items-center">
                          <Wrench className="w-6 h-6 mr-2 text-indigo-500"/>
                            Pending Rental Listings ({pendingRentalListings.length})
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

                {/* Column 2: Pending Borrower Requests (High-Priority Action) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 order-2 lg:order-2">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                        <Clock className="w-6 h-6 mr-2 text-yellow-500"/>
                        Pending Borrower Requests ({requests.length})
                    </h4>
                    <div className="space-y-4">
                        {requests.map(req => {
                                const item = listings.filter(listing => listing.id === req.listingId)[0];

                                return (
                                    <div key={req.reqId}
                                         className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl shadow-inner">
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                            <span className="font-bold text-gray-900">{authenticatedUser.name}</span> wants
                                            to rent
                                            your <span className="text-indigo-600 font-bold">{item.title}</span>.
                                        </p>
                                        <p className="text-xs text-gray-600 mb-3">
                                            Duration: {req.duration} | Deposit Hold: ${req.deposit}
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
                            <p className="text-center text-sm text-gray-500 py-4">No pending requests right now. Go list
                                some more gear!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}