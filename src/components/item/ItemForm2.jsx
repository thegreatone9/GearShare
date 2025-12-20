import React from 'react';
import Loader from "../common/Loader.jsx";
import {AlertTriangle, CheckCircle} from 'lucide-react';
import {getStatusClasses, ROLE} from "../util/Util.js";
import ItemCalendar from "./ItemCalendar.jsx";
import {useItemForm} from "./useItemForm.js";
import {ActionButtons, BasicInfoSection, LenderInfoCard, PhotoSection, PricingSection} from "./ItemFormSections.jsx";

export default function ItemForm2() {
    const {
        authenticatedUser,
        loading,
        role,
        editMode,
        itemState,
        lender,
        statusMessage,
        canRequestBorrow,
        // Date State
        overallAvailableDates,
        requestDates,
        selectedRangeForLender,
        selectedRangeForBorrower,
        // Handlers
        handleChange,
        handleFileChange,
        handleDayClickForLender,
        handleDayClickForBorrower,
        disabledDaysForLender,
        disabledDaysForBorrower,
        handleSubmit,
        handleDelete,
        handleBorrowRequest,
        navigate
    } = useItemForm();

    if (loading) {
        return <Loader show={loading} message={'Loading Item Details'} />;
    }

    if (itemState.id && !itemState.title) {
        return <div className="py-8 text-center text-red-600">Listing not found. Invalid item ID.</div>;
    }

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {editMode ? (itemState.id ? `Edit Listing: ${itemState.title}` : 'Create Listing') : `Viewing Listing: ${itemState.title}`}
            </h3>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-6">
                {/* Status Message Banner */}
                {statusMessage.text && (
                    <div className={`p-4 rounded-lg border-l-4 font-medium ${getStatusClasses(statusMessage.type)} flex items-center`}>
                        {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3"/> : <AlertTriangle className="w-5 h-5 mr-3"/>}
                        {statusMessage.text}
                    </div>
                )}

                {/* 1. Basic Info */}
                <BasicInfoSection
                    editMode={editMode}
                    itemState={itemState}
                    handleChange={handleChange}
                />

                {/* 2. Pricing */}
                <PricingSection
                    editMode={editMode}
                    itemState={itemState}
                    handleChange={handleChange}
                />

                {/* 3. Photos */}
                <PhotoSection
                    editMode={editMode}
                    itemState={itemState}
                    handleFileChange={handleFileChange}
                />


                {/* 4. Borrower: Lender Details */}
                {role === ROLE.BORROWER && lender && (
                    <LenderInfoCard lender={lender} />
                )}

                {/* 4. Lender: Availability Calendar */}
                {((role === ROLE.LENDER && !itemState.id) || (itemState.owner_id === authenticatedUser.id)) && (
                    <div className="space-y-4 pb-6 mx-auto flex flex-col">
                        <h4 className="text-xl font-semibold text-indigo-700 text-center">4. Available Dates</h4>
                        <ItemCalendar
                            role={ROLE.LENDER}
                            selectedRange={selectedRangeForLender}
                            onSelect={handleDayClickForLender}
                            disabledDays={disabledDaysForLender}
                            dateRangeStr={overallAvailableDates}
                            error={statusMessage.field === 'rent_dates' ? statusMessage.text : null}
                            defaultMonth={overallAvailableDates.from || new Date()}
                        />
                    </div>
                )}

                {/* 5. Borrower: Request Dates */}
                {role === ROLE.BORROWER && itemState.owner_id !== authenticatedUser.id && (
                    <div className="space-y-4 pb-6 mx-auto flex flex-col">
                        <h4 className="text-xl font-semibold text-indigo-700 text-center">5. Request Rent Dates</h4>
                        {canRequestBorrow ? (
                            <ItemCalendar
                                role={ROLE.BORROWER}
                                selectedRange={selectedRangeForBorrower}
                                onSelect={handleDayClickForBorrower}
                                disabledDays={disabledDaysForBorrower}
                                dateRangeStr={requestDates}
                                error={statusMessage.field === 'rent_dates' ? statusMessage.text : null}
                                defaultMonth={overallAvailableDates.from}
                            />
                        ) : (
                            <p className="text-center text-red-500">Item is unavailable for requests.</p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <ActionButtons
                        role={role}
                        editMode={editMode}
                        itemState={itemState}
                        canRequestBorrow={canRequestBorrow}
                        onBack={(e) => { e.preventDefault(); navigate(-1); }}
                        onDelete={handleDelete}
                        onBorrow={handleBorrowRequest}
                    />
                </div>
            </form>
        </div>
    );
}