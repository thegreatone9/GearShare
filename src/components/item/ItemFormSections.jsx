import React from 'react';
import {
    BadgeDollarSign,
    BookA,
    BookOpenText,
    ChartNoAxesColumnIncreasing,
    Mail,
    MapPinned,
    Phone,
    Shield,
    Tags,
    Timer,
    User
} from 'lucide-react';
import {
    LISTING_CATEGORY,
    LISTING_CONDITION,
    RENTAL_STATUS,
    ROLE,
    TIME_UNIT,
    upperCaseFirstLetter, userImageSrc
} from "../util/Util.js";

// 1. Basic Info
export const BasicInfoSection = ({ editMode, itemState, handleChange }) => (
    <div className="space-y-4 pb-6">
        <h4 className="text-xl font-semibold text-indigo-700">1. Basic Item Information</h4>
        <div>
            <label htmlFor="title" className={getLabelClass(editMode)}><BookA className="inline w-4 h-4 ml-2 text-purple-500" /> Item Name / Title</label>
            {editMode ? (
                <input id="title" type="text" required placeholder="e.g., DeWalt Drill" value={itemState.title} onChange={handleChange} className="form-input w-full px-4 py-3 border rounded-lg" />
            ) : (
                <p className="read-only-field">{itemState.title}</p>
            )}
        </div>
        <div>
            <label htmlFor="location" className={getLabelClass(editMode)}><MapPinned className="inline w-4 h-4 ml-2 text-orange-500" /> Location</label>
            {editMode ? (
                <input id="location" type="text" required placeholder="City, State" value={itemState.location} onChange={handleChange} className="form-input w-full px-4 py-3 border rounded-lg" />
            ) : (
                <p className="read-only-field">{itemState.location}</p>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={getLabelClass(editMode)}><Tags className="inline w-4 h-4 ml-2 text-blue-500" /> Category</label>
                {editMode ? (
                    <select id="category" required value={itemState.category} onChange={handleChange} className="form-select w-full px-4 py-3 border rounded-lg bg-white">
                        <option value="" disabled>Select Category</option>
                        {Object.values(LISTING_CATEGORY).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                ) : (
                    <p className="read-only-field">{itemState.category}</p>
                )}
            </div>
            <div>
                <label className={getLabelClass(editMode)}><ChartNoAxesColumnIncreasing className="inline w-4 h-4 ml-2 text-yellow-500" /> Condition</label>
                {editMode ? (
                    <select id="condition" required value={itemState.condition} onChange={handleChange} className="form-select w-full px-4 py-3 border rounded-lg bg-white">
                        <option value="" disabled>Select Condition</option>
                        {Object.values(LISTING_CONDITION).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                ) : (
                    <p className="read-only-field">{itemState.condition} / 5</p>
                )}
            </div>
        </div>
        <div>
            <label htmlFor="description" className={getLabelClass(editMode)}><BookOpenText className="inline w-4 h-4 ml-2 text-gray-500" /> Description</label>
            {editMode ? (
                <textarea id="description" rows="4" required value={itemState.description} placeholder="Describe the Item..." onChange={handleChange} className="form-textarea w-full px-4 py-3 border rounded-lg" />
            ) : (
                <p className="read-only-field whitespace-pre-wrap"><i>{itemState.description || 'No description'}</i></p>
            )}
        </div>
    </div>
);

// 2. Pricing
export const PricingSection = ({ editMode, itemState, handleChange }) => (
    <div className="space-y-4 pb-6">
        <h4 className="text-xl font-semibold text-indigo-700">2. Pricing & Protection</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label htmlFor="price" className={getLabelClass(editMode)}><BadgeDollarSign className="inline w-4 h-4 ml-2 text-green-500" /> Rate ($)</label>
                {editMode ? (
                    <input id="price" type="number" required value={itemState.price} placeholder="Price per unit time" onChange={handleChange} className="form-input w-full px-4 py-3 border rounded-lg" />
                ) : (
                    <p className="read-only-field">${itemState.price}</p>
                )}
            </div>
            <div>
                <label className={getLabelClass(editMode)}><Timer className="inline w-4 h-4 ml-2 text-yellow-500" /> Time Unit</label>
                {editMode ? (
                    <select id="time_unit" required value={itemState.time_unit} onChange={handleChange} className="form-select w-full px-4 py-3 border rounded-lg bg-white">
                        <option value="" disabled>Select Time Unit</option>
                        {Object.values(TIME_UNIT).map(c => <option key={c} value={c}>{upperCaseFirstLetter(c)}</option>)}
                    </select>
                ) : (
                    <p className="read-only-field">{upperCaseFirstLetter(itemState.time_unit)}</p>
                )}
            </div>
            <div>
                <label htmlFor="value" className={getLabelClass(editMode)}><Shield className="inline w-4 h-4 ml-2 text-red-500" /> Replacement Value ($)</label>
                {editMode ? (
                    <input id="value" type="number" required value={itemState.replacement_value} placeholder="Security Deposit Amount" onChange={handleChange} className="form-input w-full px-4 py-3 border rounded-lg" />
                ) : (
                    <p className="read-only-field">${itemState.replacement_value}</p>
                )}
            </div>
        </div>
    </div>
);

// 4. Lender Info Card
export const LenderInfoCard = ({ lender }) => (
    <div className="space-y-4 pb-6 mx-auto flex flex-col items-center">
        <h4 className="text-xl font-semibold text-indigo-700">4. Lender Details</h4>
        <img src={userImageSrc(lender.name)} alt={lender.name} className="w-24 h-24 object-cover rounded-full" />
        <InfoRow icon={User} label="Name" value={lender.name} />
        <InfoRow icon={Mail} label="Email" value={lender.email} />
        <InfoRow icon={Phone} label="Phone" value={lender.phone || 'N/A'} />
    </div>
);
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col items-center w-full">
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center"><Icon className="w-4 h-4 mr-2 text-indigo-600" /> {label}</label>
        <p className="w-1/2 px-4 py-3 bg-gray-50 text-center rounded-lg border">{value}</p>
    </div>
);

// 5. Action Buttons
export const ActionButtons = ({ role, editMode, itemState, canRequestBorrow, onBack, onDelete, onBorrow }) => {
    const commonClass = "flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold transition duration-150 w-full";
    const isNew = !itemState.id;
    const itemStatus = itemState.status;

    return (
        <>
            {/* 1. Back Button (Always Present) */}
            <button
                type="button"
                onClick={onBack}
                className={`${commonClass} bg-gray-200 hover:bg-gray-500 text-black`}
            >
                Back
            </button>

            {/* 2. Lender Actions */}
            {!isNew && editMode ? (
                <>
                    <button type="submit" className={`${commonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>
                        Save Changes
                    </button>

                    {[RENTAL_STATUS.PENDING_BORROW].includes(itemStatus) && (
                        <button type="button" onClick={onDelete} className={`${commonClass} bg-red-600 hover:bg-red-700 text-white`}>
                            Delete Listing
                        </button>
                    )}
                </>
            ) : (
                ROLE.LENDER && isNew &&
                <button type="submit" className={`${commonClass} bg-indigo-600 hover:bg-indigo-700 text-white`}>
                    Publish Item
                </button>
            )}

            {/* 3. Borrower Actions */}
            {role !== ROLE.LENDER && canRequestBorrow && (
                <button type="button" onClick={onBorrow} className={`${commonClass} bg-green-600 hover:bg-green-700 text-white`}>
                    Request Borrow
                </button>
            )}
        </>
    );
};

const getLabelClass = (editMode, extraClasses = "block") => {
    const base = "text-sm font-medium text-gray-700 mb-1";
    // Only underline if NOT in edit mode
    const underline = !editMode ? "underline decoration-gray-300 underline-offset-2" : "";
    return `${extraClasses} ${base} ${underline}`;
};