import {CheckCheck, Clock, Landmark, Package, ShieldAlert, Wrench, Zap} from 'lucide-react';
import {Link} from 'react-router-dom';
import {RENTAL_STATUS, ROLE} from "../util/Util.js";
import LenderActionModal from "./LenderActionModal.jsx";
import DashboardListSection from "./DashboardListSection.jsx";
import React from 'react';
import {getDisputeDisplay} from "./LenderUtil.js";

export default function LenderDashboardPresenter({
                                                     itemDetailsModalActive,
                                                     isModalOpen,
                                                     closeAllModals,
                                                     category,
                                                     modalProps,

                                                     activeRentals,
                                                     pendingRentalListings,
                                                     disputedRentals,
                                                     pastRentals,
                                                     requests,
                                                     listings,

                                                     openAcceptModal,
                                                     openItemDetailsModal,
                                                     declineRequest,
                                                     editItem,
                                                     handleViewDisputes,
                                                     openBorrowerModal
                                                 }) {

    // 1. Active Rentals Item Renderer
    const renderActiveRental = (rental) => {
        const correspondingRequest = requests.find(request => request.id === rental.request_id);
        const item = listings.find(listing => listing.id === correspondingRequest.listing_id);

        const returnDate = correspondingRequest?.rent_end_date ? correspondingRequest.rent_end_date : 'N/A';

        return (
            <div key={rental.id}
                 className="p-2 border border-indigo-200 rounded-xl flex justify-between items-center bg-indigo-50 hover:bg-indigo-100 transition w-full">
                <div className="flex items-center space-x-4 cursor-pointer"
                     onClick={() => openItemDetailsModal(item)}>
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
                    <button className="text-sm ml-2 text-white bg-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-700 transition"
                            onClick={() => editItem(item.id, RENTAL_STATUS.ACTIVE)}>
                        Manage Item
                    </button>
                </div>
            </div>
        );
    };

    // 2. Pending Requests Item Renderer
    const renderPendingRequest = (req) => {
        const item = listings.find(listing => listing.id === req.listing_id);

        return (
            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex items-center space-x-3 cursor-pointer"
                     onClick={() => openItemDetailsModal(item)}>
                    <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded-lg object-cover"/>
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-sm text-gray-700 mb-1">
                            <a href="#" className="font-bold text-indigo-900 hover:underline" onClick={(event) => openBorrowerModal(event, req.borrower_id)}>Borrower</a> wants
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
        );
    };

    // 3. Available Inventory Item Renderer
    const renderAvailableInventory = (item) => {
        return (
            <div key={item.id}
                 className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex items-center space-x-3 cursor-pointer"
                     onClick={() => openItemDetailsModal(item)}>
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
                    <button className="text-xs ml-2 text-white bg-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-700 transition"
                            onClick={() => editItem(item.id, RENTAL_STATUS.PENDING_BORROW)}>Manage
                    </button>
                </div>
            </div>
        );
    };

    // 4. Disputed Rentals Item Renderer
    const renderDisputedRental = (rental) => {
        const correspondingRequest = requests.find(request => request.id === rental.request_id);
        const item = listings.find(listing => listing.id === correspondingRequest.listing_id);
        const dispute = disputedRentals.find(d => d.rental_id === rental.id);
        const display = getDisputeDisplay(dispute);

        return (
            <div key={rental.id}
                 className="flex justify-between items-center p-3 border border-red-300 bg-red-50 rounded-lg">
                <div className='flex space-x-4 items-center cursor-pointer'
                     onClick={() => openItemDetailsModal(item)}>
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
        );
    };

    // 5. Past Rentals Item Renderer
    const renderPastRental = (rental) => {
        const correspondingRequest = requests.find(request => request.id === rental.request_id);
        const item = listings.find(listing => listing.id === correspondingRequest.listing_id);
        const dispute = disputedRentals.find(d => d.rental_id === rental.id);
        const display = getDisputeDisplay(dispute);

        return (
            <div key={rental.id}
                 className="bg-gray-100 flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition rounded-lg">
                <div className='flex space-x-4 items-center cursor-pointer'
                     onClick={() => openItemDetailsModal(item)}>
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
        );
    };


    return (
        <div className="py-8 max-w-5xl mx-auto">

            {/* USE THE WRAPPER MODAL COMPONENT */}
            {itemDetailsModalActive && (
                <LenderActionModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={closeAllModals}
                    category={category}
                    modalProps={modalProps}
                />
            )}


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
                <DashboardListSection
                    title={`Active Rentals (${activeRentals.length})`}
                    Icon={Zap}
                    iconColor="text-indigo-500"
                    list={activeRentals}
                    renderItem={renderActiveRental}
                    emptyMessage="No items are currently out on rent."
                />

                {/* II. Pending Borrower Requests (High-Priority Action) */}
                <DashboardListSection
                    title={`Pending Requests (${requests.length})`}
                    Icon={Clock}
                    iconColor="text-yellow-500"
                    list={requests}
                    renderItem={renderPendingRequest}
                    emptyMessage="No pending requests right now."
                />

                {/* III. Pending Rental Listings (Inventory) */}
                <DashboardListSection
                    title={`Available Inventory (${pendingRentalListings.length})`}
                    Icon={Wrench}
                    iconColor="text-indigo-500"
                    list={pendingRentalListings}
                    renderItem={renderAvailableInventory}
                    emptyMessage="No items are currently listed."
                />

                {/* IV. Disputed Rentals */}
                <DashboardListSection
                    title={`Disputed Rentals (${disputedRentals.length})`}
                    Icon={ShieldAlert}
                    iconColor="text-red-500"
                    list={disputedRentals}
                    renderItem={renderDisputedRental}
                    emptyMessage="No pending deposit issues."
                    HeaderAction={
                        disputedRentals.length > 0 && (
                            <button
                                onClick={handleViewDisputes}
                                className="text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition font-medium w-auto flex items-center justify-center">
                                <Landmark className='w-4 h-4 mr-2'/>
                                <span style={{fontSize: '1rem'}}>Go to Disputes Dashboard</span>
                            </button>
                        )
                    }
                />

                {/* V. Past Rentals (Settled) */}
                <DashboardListSection
                    title={`Past Rentals (Settled) (${pastRentals.length})`}
                    Icon={CheckCheck}
                    iconColor="text-green-500"
                    list={pastRentals}
                    renderItem={renderPastRental}
                    emptyMessage="No settled rentals yet."
                />
            </div>
        </div>
    );
}