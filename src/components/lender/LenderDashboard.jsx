import {CheckCheck, Clock, Landmark, Package, ShieldAlert, Wrench, Zap} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import {DISPUTE_STATUS, RENTAL_STATUS, ROLE} from "../util/Util.js";
import Modal from "../common/Modal.jsx";
import AcceptRentalRequest from "./AcceptRentalRequest.jsx";
import {useContext, useEffect, useState} from "react";
import {supabase} from "../../server/supabaseClient.js";
import {AuthContext} from "../../App.jsx";

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

export default function LenderDashboard() {
    const {authenticatedUser} = useContext(AuthContext);
    const navigate = useNavigate();

    const userId = authenticatedUser.id;

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [lenderRentals, setLenderRentals] = useState([]);
    const [disputes, setDisputes] = useState([]);

    const [modalItem, setModalItem] = useState(null);
    const [modalBorrower, setModalBorrower] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const activeRentals = lenderRentals.filter(rental => rental.status === RENTAL_STATUS.ACTIVE);
    const pendingRentalListings = listings.filter(item => !activeRentals.map(aR => aR.listing_id).includes(item.id));
    const disputedRentals = lenderRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.COMPLETED) return false;

        const dispute = disputes.find(d => d.rental_id === rental.id);
        return dispute && dispute.status !== DISPUTE_STATUS.COMPLETED;
    });
    const pastRentals = lenderRentals.filter(rental => {
        if (rental.status !== RENTAL_STATUS.COMPLETED) return false;

        const dispute = disputes.find(d => d.rental_id === rental.id);
        return !dispute || dispute.status === DISPUTE_STATUS.COMPLETED;
    });

    const editItem = function (itemId, itemStatus) {
        navigate(`/item/${itemId}?status=${itemStatus}&role=${ROLE.LENDER}`);
    }

    const handleViewDisputes = function() {
        navigate('/disputes');
    }

    const openAcceptModal = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const confirmAcceptance = async () => {
        if (!selectedRequest) {
            return;
        }

        const { id, listing_id, borrower_id, lender_id } = selectedRequest;

        const newRental = {
            id: Date.now(),
            request_id: id,
            listing_id: listing_id,
            borrower_id: borrower_id,
            lender_id: lender_id,
            return_date: null,
            status: RENTAL_STATUS.ACTIVE
        };

        const { data: rentalResult, error: rentalError } = await supabase
            .from('rentals')
            .insert([newRental])
            .single();

        if (rentalError) {
            return console.error("Error inserting new rental:", rentalError);
        }

        const { error: listingError } = await supabase
            .from('listings')
            .update({ listing_status: RENTAL_STATUS.ACTIVE })
            .eq('id', listing_id);

        if (listingError) {
            return console.error("Error updating listing status:", listingError);
        }

        const { error: requestError } = await supabase
            .from('requests')
            .delete()
            .eq('id', id);

        if (requestError) {
            return console.error("Error deleting request:", requestError);
        }

        setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
        setLenderRentals(prevRentals => [...prevRentals, rentalResult]);

        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const declineRequest = async (request) => {
        const { error } = await supabase
            .from('requests')
            .delete()
            .eq('id', request.id);

        if (error) {
            console.error(`Error declining request ${request.id}:`, error);
            return;
        }

        setRequests(prevRequests =>
            prevRequests.filter(req => req.id !== request.id)
        );
    };

    useEffect(() => {
        const fetchLenderData = async () => {
            setLoading(true);

            // Function to fetch a single table based on the lender's ID, filtered by the authenticated user's ID
            const fetchTable = async (table, fkColumn, setState) => {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq(fkColumn, userId);

                if (error) console.error(`Error fetching ${table}:`, error);
                if (data) setState(data);

                return data;
            };

            // --- 1. Fetch Core Lender Data (Listings and Requests) ---
            const [fetchedListings, fetchedRequests] = await Promise.all([
                fetchTable('listings', 'owner_id', setListings),
                fetchTable('requests', 'lender_id', setRequests),
            ]);

            const requestIds = fetchedRequests ? fetchedRequests.map(req => req.id) : [];

            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select('*, request_id')
                .in('request_id', requestIds);

            if (rentalError) console.error("Error fetching rentals:", rentalError);

            const lenderRentals = rentalData || [];
            setLenderRentals(lenderRentals);

            const rentalIds = lenderRentals.map(rental => rental.id);

            const { data: disputeData, error: disputeError } = await supabase
                .from('disputes')
                .select('*')
                .in('rental_id', rentalIds);

            if (disputeError) console.error("Error fetching disputes:", disputeError);

            setDisputes(disputeData || []);

            setLoading(false);
        };

        fetchLenderData();

    }, [userId]);

    useEffect(() => {
        if (!selectedRequest) {
            setModalItem(null);
            setModalBorrower(null);
            return;
        }

        const fetchModalData = async () => {
            setModalLoading(true);
            const listingId = selectedRequest.listing_id;
            const borrowerId = selectedRequest.borrower_id;

            // --- Fetch Modal Item (Listing) ---
            const { data: itemData, error: itemError } = await supabase
                .from('listings')
                .select('*')
                .eq('id', listingId)
                .single();

            if (itemError) console.error("Error fetching modal item:", itemError);
            setModalItem(itemData);

            // --- Fetch Modal Borrower (Account) ---
            const { data: borrowerData, error: borrowerError } = await supabase
                .from('accounts')
                .select('name, email')
                .eq('id', borrowerId)
                .single();

            if (borrowerError) console.error("Error fetching modal borrower:", borrowerError);
            setModalBorrower(borrowerData);

            setModalLoading(false);
        };

        fetchModalData();

    }, [selectedRequest]);

    if (loading) {
        return <div className="p-8 text-center text-indigo-600">Loading Lender Dashboard...</div>;
    }

    return (
        <div className="py-8 max-w-5xl mx-auto">
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Review Rental Confirmation"
                maxWidth="max-w-lg"
            >
                {modalLoading ? (
                    <div className="p-4 text-center">Loading Borrower Details...</div>
                ) : (
                    <AcceptRentalRequest
                        request={selectedRequest}
                        item={modalItem}
                        borrower={modalBorrower}
                        onClose={() => setIsModalOpen(false)}
                        onConfirm={confirmAcceptance}
                    />
                )}
            </Modal>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-gray-800">Lender Hub: Manage Inventory & Requests</h3>
                <Link to={`/item?role=${ROLE.LENDER}`}
                      className="bg-indigo-200 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-100 transition">
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

                    <div className="space-y-4">
                        {activeRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.request_id);
                            const item = listings.find(listing => listing.id === correspondingRequest.listing_id);

                            const returnDate = correspondingRequest?.rent_end_date
                                ? correspondingRequest.rent_end_date
                                : 'N/A';

                            return (
                                <div key={rental.id}
                                     className="p-2 border border-indigo-200 rounded-xl flex justify-between items-center bg-indigo-50 hover:bg-indigo-100 transition w-full">

                                    <div className="flex items-center space-x-4">
                                        <img src={item.image_url} alt={item.title}
                                             className="w-14 h-14 rounded-lg object-cover border border-indigo-300"/>
                                        <div>
                                            <p className="font-medium text-lg text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-600">Due: <span
                                                className="font-bold text-indigo-700">{returnDate}</span></p>
                                        </div>
                                    </div>

                                    <div className="text-right flex items-center justify-center">
                                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700`}>
                                          Rented
                                        </span>
                                        <button className="text-sm mx-2 text-white bg-indigo-600"
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
                                const item = listings.find(listing => listing.id === req.listing_id);

                                return (
                                    <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <div className="flex items-center space-x-3">
                                            <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded-lg object-cover"/>
                                            <div className="flex flex-col justify-center items-center">
                                                <p className="text-sm text-gray-700 mb-1">
                                                    <span className="font-bold text-gray-900">Borrower</span> wants
                                                    to rent <span className="text-indigo-600 font-bold">{item.title}</span>.
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Request Date: {req.date || 'N/A'} | Deposit: ${req.deposit || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={() => openAcceptModal(req)}
                                                className="text-xs ml-2 font-semibold text-white bg-green-600 px-3 py-1 rounded-lg hover:bg-green-700 transition">
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => declineRequest(req)}
                                                className="text-xs ml-2 font-semibold text-red-600 bg-white border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50 transition">
                                                Decline
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
                                        <img src={item.image_url} alt={item.title}
                                             className="w-12 h-12 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">Rent: ${item.price}/day</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700`}>
                                          Available
                                        </span>
                                        <button className="text-xs text-white bg-indigo-600 mt-1 mx-2 hover:underline"
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
                            const correspondingRequest = requests.find(request => request.id === rental.request_id);
                            const item = listings.find(listing => listing.id === correspondingRequest.listing_id);
                            const dispute = disputes.find(d => d.rental_id === rental.id);
                            const display = getDisputeDisplay(dispute);

                            return (
                                <div key={rental.id}
                                     className="flex justify-between items-center p-3 border border-red-300 bg-red-50 rounded-lg">
                                    <div className='flex space-x-4 items-center'>
                                        <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">Return Date: {new Date(rental.return_date).toLocaleDateString()}</p>
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
                            const correspondingRequest = requests.find(request => request.id === rental.request_id);
                            const item = listings.find(listing => listing.id === correspondingRequest.listing_id);
                            const dispute = disputes.find(d => d.rental_id === rental.id);
                            const display = getDisputeDisplay(dispute);

                            return (
                                <div key={rental.id}
                                     className="bg-gray-100 flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition rounded-lg">
                                    <div className='flex space-x-4 items-center'>
                                        <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">Returned: {new Date(rental.return_date).toLocaleDateString()}</p>
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