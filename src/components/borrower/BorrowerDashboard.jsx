import React, {useContext, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Landmark, Package, ShieldAlert, Zap} from 'lucide-react';
import {DISPUTE_STATUS, RENTAL_STATUS} from "../util/Util.js";
import {supabase} from "../../server/supabaseClient.js";
import {AuthContext} from "../../App.jsx";

export default function BorrowerDashboard() {
    const navigate = useNavigate();
    const {authenticatedUser} = useContext(AuthContext);
    const userId = authenticatedUser.id;

    const [loading, setLoading] = useState(true);

    const [listings, setListings] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [requests, setRequests] = useState([]);
    const [borrowerRentals, setBorrowerRentals] = useState([]);

    useEffect(() => {
        const fetchBorrowerData = async () => {
            setLoading(true);

            const { data: requestData, error: reqError } = await supabase
                .from('requests')
                .select('*')
                .eq('borrower_id', userId);

            if (reqError) {
                console.error("Error fetching requests:", reqError);
            }

            const fetchedRequests = requestData || [];
            setRequests(fetchedRequests);

            const requestIds = fetchedRequests.map(req => req.id);
            const listingIds = fetchedRequests.map(req => req.listing_id);

            // 2. Fetch Rentals associated with those Requests
            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select('*, request_id')
                .in('request_id', requestIds);

            if (rentalError) {
                console.error("Error fetching rentals:", rentalError);
            }
            const fetchedRentals = rentalData || [];
            setBorrowerRentals(fetchedRentals);

            // 3. Fetch Listings needed for display titles
            const { data: listingData, error: listingError } = await supabase
                .from('listings')
                .select('*')
                .in('id', listingIds);

            if (listingError) {
                console.error("Error fetching listings:", listingError);
            }
            setListings(listingData || []);

            // 4. Fetch Disputes linked to the retrieved Rentals
            const rentalIds = fetchedRentals.map(rental => rental.id);

            const { data: disputeData, error: disputeError } = await supabase
                .from('disputes')
                .select('*')
                .in('rental_id', rentalIds);

            if (disputeError) {
                console.error("Error fetching disputes:", disputeError);
            }

            setDisputes(disputeData || []);
            setLoading(false);
        };

        fetchBorrowerData();

    }, [userId]);

    // --- 2. Derived State (useMemo) ---
    const { activeRentals, disputedRentals, pastRentals } = useMemo(() => {

        const findDispute = (rental) => disputes.find(d => d.rental_id === rental.id);

        const active = [];
        const disputed = [];
        const past = [];

        borrowerRentals.forEach(rental => {
            const dispute = findDispute(rental);

            if (rental.status === RENTAL_STATUS.ACTIVE) {
                active.push(rental);

            } else if (rental.status === RENTAL_STATUS.COMPLETED) {
                if (dispute && dispute.status !== DISPUTE_STATUS.COMPLETED) {
                    disputed.push(rental);

                } else {
                    past.push(rental);
                }
            }
        });

        return { activeRentals: active, disputedRentals: disputed, pastRentals: past };

    }, [borrowerRentals, disputes]);

    // --- Handlers ---
    const handleReturn = async function (rental, event) {
        event.preventDefault();

        const returnDate = new Date().toISOString();

        const newDisputeData = {
            rental_id: rental.id,
            start_date: returnDate,
            status: DISPUTE_STATUS.PENDING_DEPOSIT_RETURN
        };

        // --- Database Transactions ---
        // A. INSERT the new dispute record first
        const {data: disputeResult, error: disputeError} = await supabase
            .from('disputes')
            .insert([newDisputeData])
            .select()
            .single();

        if (disputeError) {
            console.error("Error creating dispute record:", disputeError);
            return;
        }

        const updatedRentalData = {
            return_date: returnDate,
            status: RENTAL_STATUS.COMPLETED,
            dispute_id: disputeResult.id
        };

        const {data: rentalResult, error: rentalError} = await supabase
            .from('rentals')
            .update(updatedRentalData)
            .eq('id', rental.id)
            .select()
            .single();

        if (rentalError) {
            console.error("Error updating rental status:", rentalError);
            return;
        }

        setBorrowerRentals(prevRentals =>
            prevRentals.map(r => r.id === rental.id ? rentalResult : r)
        );
        setDisputes(prevDisputes => [...prevDisputes, disputeResult]);

        navigate('/disputes');
    }

    const handleViewDispute = function () {
        navigate(`/disputes`);
    }

    if (loading) {
        return <div className="p-8 text-center text-indigo-600">Loading Borrower Dashboard...</div>;
    }

    return (
        <div className="py-8 max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-8">Borrower History: Your Rentals</h3>

            <div className="space-y-10">
                {/* 1. Active Rentals (Physically Out) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <Zap className="w-7 h-7 mr-2 text-indigo-500"/>
                        Active Rentals ({activeRentals.length})
                    </h4>

                    <div className="space-y-4">
                        {activeRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.request_id);
                            const item = listings.find(listing => listing.id === correspondingRequest.listing_id);
                            const returnDate = correspondingRequest?.rent_end_date || 'N/A';

                            return (
                                <div key={rental.id}
                                     className="flex items-center justify-between p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                    <div className="flex items-center space-x-3">
                                        <img src={item.image_url} alt={item.title}
                                             className="w-12 h-12 rounded-lg object-cover"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">Due: <span className="font-bold text-indigo-700">{returnDate}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <button className="text-xs text-white bg-indigo-600 mt-1 hover:underline"
                                                onClick={(event) => handleReturn(rental, event)}>Pay & Return Item Now
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        {activeRentals.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-4 border rounded-lg">No items are currently out on rent.</p>
                        )}
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

                    {/* SINGLE SECTION-WIDE BUTTON */}
                    {disputedRentals.length > 0 && (
                        <button
                            onClick={handleViewDispute}
                            className="text-sm text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-600 transition font-medium mb-4 w-full flex items-center justify-center">
                            <Landmark className='w-4 h-4 mr-2'/>
                            Go to Disputes Dashboard
                        </button>
                    )}

                    {/* Items are now stacked vertically (space-y-4) */}
                    <div className="space-y-4">
                        {disputedRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.request_id);
                            const item = listings.find(listing => listing.id === correspondingRequest.listing_id);
                            const dispute = disputes.find(d => d.rentalId === rental.id);
                            const display = getDisputeDisplay(dispute);

                            return (
                                <div key={rental.id}
                                     className="p-2 border border-red-300 bg-red-50 rounded-xl flex justify-between items-center hover:bg-red-100 transition w-full">
                                    {/* Item Details (Left Side) */}
                                    <div className="flex items-center space-x-4">
                                        <img src={item.image_url} alt={item.title}
                                             className="w-12 h-12 rounded-lg object-cover border"/>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-600">Returned: <span
                                                className="font-bold">{new Date(rental.return_date).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${display.color}`}>{display.label}</span>
                                </div>
                            )
                        })}
                        {/* Display message if no disputes */}
                        {disputedRentals.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-4 border rounded-lg">No pending deposit issues.</p>
                        )}
                    </div>
                </div>

                {/* 3. Past Rentals (Settled) */}
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3 flex items-center">
                        <Package className="w-7 h-7 mr-2 text-green-500"/>
                        Past Rentals (Settled) ({pastRentals.length})
                    </h4>
                    <div className="space-y-4">
                        {pastRentals.map(rental => {
                            const correspondingRequest = requests.find(request => request.id === rental.request_id);
                            const item = listings.find(listing => listing.id === correspondingRequest.listing_id);
                            const dispute = disputes.find(d => d.rentalId === rental.id);
                            const display = getDisputeDisplay(dispute);

                            return (
                                <div key={rental.id}
                                     className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition rounded-lg">
                                    <div className='flex space-x-4 items-center'>
                                        <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover"/>
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
                            <p className="text-center text-sm text-gray-500 py-4 border rounded-lg">No settled rentals yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const getDisputeDisplay = (dispute) => {
    if (!dispute || dispute.status === DISPUTE_STATUS.COMPLETED) {
        return { label: 'Settled', color: 'bg-green-100 text-green-700' };
    }

    switch (dispute.status) {
        case DISPUTE_STATUS.PENDING_DEPOSIT_RETURN:
            return { label: 'Awaiting Lender Review', color: 'bg-yellow-100 text-yellow-700' };
        case DISPUTE_STATUS.ACTIVE:
            return { label: 'Lender Claim Filed', color: 'bg-red-100 text-red-700' };
        default:
            return { label: dispute.status, color: 'bg-gray-100 text-gray-700' };
    }
};