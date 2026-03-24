import React from 'react';
import {Package, ShieldAlert, Zap} from 'lucide-react';
import {getDisputeDisplay} from "./ClientUtil.js";
import ActionModal from "../common/ActionModal.jsx";
import DashboardListSection from "../common/DashboardListSection.jsx";
import {itemImageSrc, REQUEST_STATUS} from "../util/Util.js";

export default function ClientDashboardPresenter({
                                                       itemDetailsModalActive,
                                                       isModalOpen,
                                                       closeAllModals,
                                                       category,
                                                       modalProps,

                                                       activeRentals,
                                                       disputedRentals,
                                                       pastRentals,
                                                       requests,
                                                       listings,
                                                       disputes,
                                                       purchases,

                                                       openItemDetailsModal,
                                                       openMerchantDetailsModal,
                                                       handleReturn,
                                                       handleViewDispute,
                                                       cancelRequest
                                                   }) {

    const pendingRequests = requests.filter(req => req.status === REQUEST_STATUS.ACTIVE);

    const getItemAndRequest = (rental) => {
        const correspondingRequest = requests.find(req => req.id === rental.request_id);
        const item = listings.find(listing => listing.id === correspondingRequest?.listing_id);
        const dispute = disputes.find(d => d.rental_id === rental.id);

        return { item, correspondingRequest, dispute };
    };

    // 1. Active Rentals Item Renderer
    const renderActiveRental = (rental) => {
        const { item, correspondingRequest } = getItemAndRequest(rental);
        if (!item || !correspondingRequest) return null; // Safety check

        const returnDate = correspondingRequest?.end_date || 'N/A';

        return (
            <div key={rental.id}
                 className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition gap-8">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => openItemDetailsModal(item)}>
                    <img src={itemImageSrc(item.image_url, item.title)} alt={item.title}
                         className="w-12 h-12 rounded-lg object-cover"/>
                    <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">Due: <span className="font-bold text-red-500">{returnDate}</span></p>
                    </div>
                </div>
                <div className="sm:text-right">
                    {/* Action button to initiate return/dispute */}
                    <button className="text-xs text-white bg-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-700 transition"
                            onClick={(event) => handleReturn(rental, event)}>Pay & Return Item Now
                    </button>
                    <button className="text-sm ml-2 text-white bg-amber-500 px-3 py-1 rounded-lg hover:bg-orange-700 transition"
                            onClick={(event) => openMerchantDetailsModal(event, item.owner_id)}>
                        Merchant Details
                    </button>
                </div>
            </div>
        );
    };

    // 2. Requested Rentals
    const renderRequestedRental = (req) => {
        const item = listings.find(listing => listing.id === req.listing_id);

        return (
            <div key={req.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-8 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex items-center space-x-3 cursor-pointer"
                     onClick={() => openItemDetailsModal(item)}>
                    <img src={itemImageSrc(item.image_url, item.title)} alt={item.title} className="w-12 h-12 rounded-lg object-cover"/>
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-sm text-gray-700 mb-1">
                            Requested <span className="text-indigo-600 font-bold">{item.title}</span> from <a href="#" className="font-bold text-indigo-900 hover:underline" onClick={(event) => openMerchantDetailsModal(event, req.merchant_id)}>Merchant</a>
                        </p>
                        <p className="text-xs text-gray-600">
                            Request Date: {req.date || 'N/A'} | Deposit: ${item.replacement_value || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="sm:text-right">
                    <button
                        onClick={() => cancelRequest(req)}
                        className="text-xs ml-2 font-semibold text-red-600 bg-white border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50 transition">
                        Cancel Request
                    </button>
                </div>
            </div>
        );
    };

    // 3. Disputed Rentals Item Renderer
    const renderDisputedRental = (rental) => {
        const { item, dispute } = getItemAndRequest(rental);
        if (!item || !dispute) return null; // Safety check

        const display = getDisputeDisplay(dispute);

        return (
            <div key={rental.id}
                 className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 border border-red-300 bg-red-50 rounded-xl hover:bg-red-100 transition w-full gap-8">
                {/* Item Details (Left Side) */}
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => openItemDetailsModal(item)}>
                    <img src={itemImageSrc(item.image_url, item.title)} alt={item.title}
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
        );
    };

    // 4. Past Rentals Item Renderer
    const renderPastRental = (rental) => {
        const { item, dispute } = getItemAndRequest(rental);
        if (!item) return null;

        const display = getDisputeDisplay(dispute);

        return (
            <div key={rental.id}
                 className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition rounded-lg gap-8">
                <div className='flex space-x-4 items-center cursor-pointer' onClick={() => openItemDetailsModal(item)}>
                    <img src={itemImageSrc(item.image_url, item.title)} alt={item.title} className="w-10 h-10 rounded-lg object-cover"/>
                    <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">Returned: {new Date(rental.return_date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className='sm:text-right'>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${display.color}`}>
                        {display.label}
                    </span>
                    <button className="text-sm ml-2 text-white bg-amber-500 px-3 py-1 rounded-lg hover:bg-orange-700 transition"
                            onClick={(event) => openMerchantDetailsModal(event, item.owner_id)}>
                        Merchant Details
                    </button>
                </div>
            </div>
        );
    };

    // 5. Purchases Item Renderer
    const renderPurchase = (purchase) => {
        const snapshot = purchase.listing_snapshot;
        if (!snapshot) return null;

        return (
            <div key={purchase.id}
                 className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition gap-8">
                <div className="flex items-center space-x-3 cursor-pointer"
                     onClick={() => openItemDetailsModal(snapshot)}>
                    <img src={itemImageSrc(snapshot.image_url, snapshot.title)} alt={snapshot.title}
                         className="w-12 h-12 rounded-lg object-cover border border-emerald-300"/>
                    <div>
                        <p className="font-medium text-gray-900">{snapshot.title}</p>
                        <p className="text-sm text-gray-500">Purchased: {purchase.date}</p>
                    </div>
                </div>
                <div className="sm:text-right flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-700">${snapshot.price}</span>
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                        Purchased ✅
                    </span>
                </div>
            </div>
        );
    };


    return (
        <div className="py-8 max-w-7xl mx-auto">
            {itemDetailsModalActive && (
                <ActionModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={closeAllModals}
                    category={category}
                    modalProps={modalProps}
                />
            )}

            <h3 className="text-3xl font-bold text-gray-800 mb-8">Client Dashboard</h3>

            <div className="space-y-10">
                {/* 1. Active Rentals (Physically Out) */}
                <DashboardListSection
                    title={`Active Rentals (${activeRentals.length})`}
                    Icon={Zap}
                    iconColor="text-indigo-500"
                    list={activeRentals}
                    renderItem={renderActiveRental}
                    emptyMessage="No items are currently out on rent."
                />

                {/* 2. Pending Rentals */}
                <DashboardListSection
                    title={`Requested Rentals (${pendingRequests.length})`}
                    Icon={Zap}
                    iconColor="text-indigo-500"
                    list={pendingRequests}
                    renderItem={renderRequestedRental}
                    emptyMessage="No requests for rentals are made."
                />

                {/* 3. My Purchases */}
                <DashboardListSection
                    title={`My Purchases (${purchases.length})`}
                    Icon={Package}
                    iconColor="text-emerald-500"
                    list={purchases}
                    renderItem={renderPurchase}
                    emptyMessage="No purchases yet."
                />

                {/* 4. Disputed Rentals (Returned but Unsettled) */}
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
                                onClick={handleViewDispute}
                                className="text-sm text-white bg-red-600 px-3 py-1 rounded-lg hover:bg-red-700 transition font-medium w-auto flex items-center justify-center">
                                <span style={{fontSize: '1rem'}}>Go to Disputes Dashboard</span>
                            </button>
                        )
                    }
                />

                {/* 5. Past Rentals (Settled) */}
                <DashboardListSection
                    title={`Past Rentals (Settled) (${pastRentals.length})`}
                    Icon={Package}
                    iconColor="text-green-500"
                    list={pastRentals}
                    renderItem={renderPastRental}
                    emptyMessage="No settled rentals yet."
                />
            </div>
        </div>
    );
}
