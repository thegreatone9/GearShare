import React from 'react';
import {
    BookA,
    BookOpenText,
    Calendar,
    ChartNoAxesColumnIncreasing,
    DollarSign,
    Mail,
    MapPinned,
    Phone,
    Shield,
    Tags,
    User
} from 'lucide-react'; // Assuming lucide-react
import {LISTING_CATEGORY, LISTING_CONDITION, LISTING_TYPE, RENTAL_STATUS, ROLE, userImageSrc} from "../util/Util.js";

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

export const PricingSection = ({ editMode, itemState, handleChange }) => {
    const isSell = itemState.listing_type === 'SELL';

    return (
        <div className="space-y-4 pb-6">
            <h4 className="text-xl font-semibold text-indigo-700">2. Listing Type & Pricing</h4>

            {/* Listing Type Toggle */}
            {editMode && (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleChange({ target: { id: 'listing_type', value: 'RENT' } })}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${!isSell ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        📦 For Rent
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChange({ target: { id: 'listing_type', value: 'SELL' } })}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${isSell ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        🏷️ For Sale
                    </button>
                </div>
            )}

            {!editMode && (
                <p className="read-only-field">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${isSell ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {isSell ? '🏷️ For Sale' : '📦 For Rent'}
                    </span>
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isSell ? (
                    /* Sale Price */
                    <div>
                        <label htmlFor="price" className={getLabelClass(editMode)}>
                            <DollarSign className="inline w-4 h-4 mr-2 text-emerald-500" />
                            Sale Price ($)
                        </label>
                        {editMode ? (
                            <input
                                id="price"
                                type="number"
                                min="1"
                                required
                                value={itemState.price || ''}
                                placeholder="e.g. 250"
                                onChange={handleChange}
                                className="form-input w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        ) : (
                            <p className="read-only-field text-emerald-700 font-bold text-lg">${itemState.price}</p>
                        )}
                    </div>
                ) : (
                    /* Rental Fields */
                    <>
                        <div>
                            <label htmlFor="daily_rate" className={getLabelClass(editMode)}>
                                <Calendar className="inline w-4 h-4 mr-2 text-green-500" />
                                Daily Rate ($)
                            </label>
                            {editMode ? (
                                <input
                                    id="daily_rate"
                                    type="number"
                                    min="0"
                                    value={itemState.daily_rate || ''}
                                    placeholder="e.g. 100"
                                    onChange={handleChange}
                                    className="form-input w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            ) : (
                                <p className="read-only-field">
                                    {itemState.daily_rate ? `$${itemState.daily_rate} / day` : <span className="text-gray-400 italic">Not offered</span>}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="replacement_value" className={getLabelClass(editMode)}>
                                <Shield className="inline w-4 h-4 mr-2 text-red-500" />
                                Replacement Value ($)
                            </label>
                            {editMode ? (
                                <input
                                    id="replacement_value"
                                    type="number"
                                    required
                                    value={itemState.replacement_value}
                                    placeholder="Security Deposit Amount"
                                    onChange={handleChange}
                                    className="form-input w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="read-only-field">${itemState.replacement_value}</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// 4. Lender/Seller Info Card
export const LenderInfoCard = ({ lender, isSellListing }) => (
    <div className="space-y-4 pb-6 mx-auto flex flex-col items-center">
        <h4 className="text-xl font-semibold text-indigo-700">
            {isSellListing ? '4. Seller Details' : '4. Merchant Details'}
        </h4>
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
export const ActionButtons = ({ role, editMode, itemState, canRequestBorrow, isSellListing, isOwner, onBack, onDelete, onBorrow, onBuyNow }) => {
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

            {/* 2. Lender/Seller Actions */}
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

            {/* 3. Buyer/Borrower Actions */}
            {!isOwner && isSellListing && (
                <button type="button" onClick={onBuyNow} className={`${commonClass} bg-emerald-600 hover:bg-emerald-700 text-white`}>
                    🛒 Buy Now — ${itemState.price}
                </button>
            )}
            {!isOwner && !isSellListing && canRequestBorrow && (
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