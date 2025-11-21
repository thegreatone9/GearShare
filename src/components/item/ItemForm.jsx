import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {Mail, Package, Shield, User} from 'lucide-react';
import {
    BORROWER_ITEM_ACTIONS,
    LENDER_ITEM_ACTIONS,
    LISTING_CATEGORY,
    RENTAL_STATUS,
    REQUEST_STATUS,
    ROLE
} from "../util/Util.js";
import {supabase} from "../../server/supabaseClient.js";
import {AuthContext} from "../../App.jsx";

export default function ItemForm() {
    const {authenticatedUser} = useContext(AuthContext);
    const navigate = useNavigate();
    const {id} = useParams();

    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');
    const itemStatusForLender = searchParams.get('status');

    // Convert itemId to a number for safe comparison with mock data
    const itemIdNum = parseInt(id);

    const [currentItem, setCurrentItem] = useState(null);
    const [itemState, setItemState] = useState(null);
    const [lender, setLender] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [canRequestBorrow, setCanRequestBorrow] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // --- Button Mapping Function ---
    const getActionButtons = () => {
        const commonClasses = "flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 w-full";
        let buttonProps;

        // Button properties include: label, onClick handler (type 'submit' is handled below), and classes.
        if (role === ROLE.LENDER) {
            if (editMode) {
                buttonProps = [
                    {
                        label: "Save Changes",
                        action: LENDER_ITEM_ACTIONS.SAVE,
                        classes: `${commonClasses} bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500`
                    },
                ];

                if ([RENTAL_STATUS.PENDING_BORROW, RENTAL_STATUS.PENDING_LEND].includes(itemStatusForLender)) {
                    buttonProps.push({
                        label: "Delete Listing",
                        action: LENDER_ITEM_ACTIONS.DELETE,
                        classes: `${commonClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`,
                        onClick: (event) => handleDelete(event)
                    });
                }
            } else {
                // New Item Mode
                buttonProps = [
                    {
                        label: "Publish Item & Start Earning",
                        action: LENDER_ITEM_ACTIONS.SAVE,
                        classes: `${commonClasses} bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500`
                    }
                ];
            }

        } else if (role === ROLE.BORROWER && canRequestBorrow) {
            // Only show the request button in 'view' mode for an existing item
            buttonProps = [
                {
                    label: "Back",
                    action: "BACK",
                    classes: `${commonClasses} bg-gray-200 hover:bg-gray-500 text-black focus:ring-gray-900`,
                    onClick: (event) => {
                        event.preventDefault();
                        navigate('/marketplace');
                    }
                },
                {
                    label: "Request Borrow",
                    action: BORROWER_ITEM_ACTIONS.REQUEST_BORROW,
                    classes: `${commonClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`,
                    onClick: (event) => handleBorrowRequest(event)
                }
            ];
        }

        return buttonProps?.map(prop => (
            <button
                key={prop.action}
                type="submit"
                value={prop.action}
                className={prop.classes}
                onClick={prop.onClick}
            >
                {prop.label}
            </button>
        ));
    };

    useEffect(() => {
        if (!itemIdNum) {
            return;
        }

        const fetchItem = async () => {
            setLoading(true);
            setEditMode(false);
            setCanRequestBorrow(false);

            const {data: item, error} = await supabase
                .from('listings')
                .select('*')
                .eq('id', itemIdNum)
                .single();

            if (error || !item) {
                console.error(`Error fetching item ${itemIdNum}:`, error);

                setItemState({
                    title: '',
                    description: '',
                    location: '',
                    category: '',
                    price: '',
                    value: '',
                    unit: 'day',
                    image_url: "https://placehold.co/100x70/6366f1/ffffff?text=NEW"
                });

            } else {
                setCurrentItem(item);

                setItemState({
                    title: item.title || '',
                    description: item.description || '',
                    price: item.price || '',
                    value: item.replacement_value || '', // Ensure snake_case matches DB
                    location: item.location || '',
                    category: item.category || '',
                    unit: item.unit || 'day',
                    image_url: item.image_url // Ensure snake_case matches DB
                });
            }

            if (role === ROLE.LENDER) {
                setEditMode(!isNaN(itemIdNum));

            } else {
                const {data: request, error: requestFetchError} = await supabase
                    .from('requests')
                    .select('id')
                    .eq('listing_id', item.id)
                    .eq('borrower_id', authenticatedUser.id)
                    .eq('status', REQUEST_STATUS.ACTIVE)
                    .limit(1)
                    .maybeSingle();

                if (requestFetchError) {
                    throw new Error("Error checking request existence for borrower!");
                }

                setCanRequestBorrow(!request);

                if (role === ROLE.BORROWER) {
                    const {data: lenderData, error: lenderFetchError} = await supabase
                        .from('accounts')
                        .select('name, email')
                        .eq('id', item.owner_id)
                        .single();

                    if (lenderFetchError) {
                        throw new Error("There was an error fetching Lender Details!");
                    }

                    setLender(lenderData);
                }
            }

            setLoading(false);
        };

        fetchItem();

    }, [itemIdNum]);

    const handleChange = (e) => {
        const {id, value} = e.target;

        setItemState(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    // Simplistic handling of file input (logging for MVP)
    const handleFileChange = (e) => {
        console.log("File selected:", e.target.files[0]?.name);
        // In a real app, this would upload the file and update itemState.image_url
    };

    const handleBorrowRequest = async function (event) {
        event.preventDefault();

        try {
            const {error: requestError} = await supabase
                .from('requests')
                .insert([
                    {
                        listing_id: itemIdNum,
                        borrower_id: authenticatedUser.id,
                        status: REQUEST_STATUS.PENDING // Assuming REQUEST_STATUS.PENDING exists
                    }
                ]);

            if (requestError) {
                throw new Error(`Failed to request borrowing of listing: ${requestError.message}`);
            }

            setTimeout(() => {
                navigate('/borrower');
            }, 100);

        } catch (error) {
            console.error("Request to Borrow Error:", error.message);
        }
    }

    const handleDelete = async function (event) {
        event.preventDefault();

        try {
            // 1. Delete pending requests associated with the listing.
            await supabase
                .from('requests')
                .delete()
                .eq('listing_id', itemIdNum)
                .neq('status', REQUEST_STATUS.ACTIVE);

            // 2. Delete the main listing record.
            const {error: listingError} = await supabase
                .from('listings')
                .delete()
                .eq('id', itemIdNum);

            if (listingError) {
                throw new Error(`Failed to delete listing: ${listingError.message}`);
            }

            setTimeout(() => {
                navigate('/lender');
            }, 100);

        } catch (error) {
            console.error("Deletion Error:", error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const priceNum = parseFloat(itemState.price);
        const valueNum = parseFloat(itemState.value);

        const itemData = {
            title: itemState.title || "Untitled Gear",
            description: itemState.description,
            location: itemState.location,
            category: itemState.category,
            price: priceNum,
            replacement_value: valueNum,
            unit: itemState.unit,
            image_url: itemState.image_url
        };

        let dbError;

        if (editMode) {
            const {error} = await supabase
                .from('listings')
                .update(itemData)
                .eq('id', itemIdNum);

            dbError = error;

        } else {
            // --- NEW ITEM LOGIC (INSERT) ---
            const newItemData = {
                ...itemData,
                owner_id: authenticatedUser.id, // DB column: snake_case
            };

            const {error} = await supabase
                .from('listings')
                .insert([newItemData]);

            dbError = error;
        }

        if (dbError) {
            console.error("Database submission error:", dbError.message);
            setStatusMessage(`Error submitting item: ${dbError.message}`);

        } else {
            setTimeout(() => navigate('/lender'), 500);
        }
    };

    if (loading) {
        return <div className="py-8 text-center text-indigo-600">Loading item details...</div>;
    }

    if (editMode && !currentItem) {
        return <div className="py-8 text-center text-red-600">Listing not found. Invalid item ID.</div>;
    }

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {editMode ? `Edit Listing: ${itemState.title}` : `Viewing Listing: ${itemState.title}`}
            </h3>

            {statusMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-lg">
                    {statusMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-6">
                <div className="space-y-4 border-b pb-6">
                    <h4 className="text-xl font-semibold text-indigo-700">1. Basic Item Information</h4>

                    {/* --- TITLE FIELD --- */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Item Name /
                            Title</label>
                        {editMode ? (
                            <input
                                id="title"
                                type="text"
                                required
                                placeholder="e.g., DeWalt Cordless Drill Set"
                                value={itemState.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        ) : (
                            <p className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                {itemState.title}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Location Field */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location
                                / Pickup Area</label>
                            {editMode ? (
                                <input
                                    id="location"
                                    type="text"
                                    required
                                    placeholder="e.g., San Francisco, CA"
                                    value={itemState.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                            ) : (
                                <p className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                    {itemState.location}
                                </p>
                            )}
                        </div>

                        {/* Category Dropdown */}
                        <div>
                            <label htmlFor="category"
                                   className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            {editMode ? (
                                <select
                                    id="category"
                                    required
                                    value={itemState.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                                >
                                    <option value="" disabled>Select a Category</option>
                                    {
                                        Object.values(LISTING_CATEGORY).map(category => {
                                            return <option key={category}>{category}</option>
                                        })
                                    }
                                </select>
                            ) : (
                                <p className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                    {itemState.category}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* --- DESCRIPTION FIELD --- */}
                    <div>
                        <label htmlFor="description"
                               className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        {editMode ? (
                            <textarea
                                id="description"
                                rows="4"
                                required
                                placeholder="Describe condition, accessories included, and pickup details."
                                value={itemState.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                            ></textarea>
                        ) : (
                            <p className="w-full px-4 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 whitespace-pre-wrap">
                                <i>{itemState.description ? itemState.description : 'No description provided for this item'}</i>
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-4 border-b pb-6">
                    <h4 className="text-xl font-semibold text-indigo-700">2. Pricing & Protection Policy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Daily Rental
                                Rate ($)</label>
                            {editMode ? (
                                <input
                                    id="price"
                                    type="number"
                                    required
                                    placeholder="e.g., 15"
                                    value={itemState.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                            ) : (
                                <p className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                    ${itemState.price} / {itemState.unit}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="value"
                                   className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                Replacement Value Estimate ($)
                                <Shield className="w-4 h-4 ml-2 text-red-500"
                                        title="Required for calculating security deposit"/>
                            </label>
                            {editMode ? (
                                <input
                                    id="value"
                                    type="number"
                                    required
                                    placeholder="e.g., 350 (Mid-Value Tier)"
                                    value={itemState.value}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                                />
                            ) : (
                                <p className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                    ${itemState.value}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">This determines the borrower's security deposit
                                amount.</p>
                        </div>
                    </div>
                </div>

                {/* Photos */}
                <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-indigo-700">3. Photos (Proof of Condition)</h4>

                    {editMode ? (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                            <label htmlFor="photos" className="cursor-pointer">
                                <input id="photos" type="file" accept="image/*" multiple className="hidden"
                                       onChange={handleFileChange}/>
                                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                                <p className="text-sm font-medium text-gray-700">Click to upload up to 5 photos.</p>
                                <p className="text-xs text-gray-500">Clear photos of item and accessories are required
                                    for
                                    dispute resolution.</p>
                            </label>
                        </div>
                    ) : (
                        <div className="rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <img
                                src={itemState.image_url || "https://placehold.co/600x400/cccccc/000000?text=No+Image"}
                                alt={`Photo of ${itemState.title}`}
                                className="w-full h-80 object-cover"
                            />
                        </div>
                    )}
                </div>

                {/* Lender Details */}
                {
                    role === ROLE.BORROWER && lender &&
                    <div className="space-y-4 border-b pb-6 mx-auto flex flex-col items-center">
                        <h4 className="text-xl font-semibold text-indigo-700">4. Lender Details</h4>

                        <div className="flex flex-col items-center w-full">
                            <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                                <User className="w-4 h-4 mr-2 text-indigo-600"/> Full Name
                            </label>
                            <p className="w-1/2 px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200 text-center">
                                {lender.name}
                            </p>
                        </div>

                        <div className="flex flex-col items-center w-full">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                                <Mail className="w-4 h-4 mr-2 text-indigo-600"/> Email Address
                            </label>
                            <p className="w-1/2 px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200 text-center">
                                {lender.email}
                            </p>
                        </div>

                        <div className="flex flex-col items-center w-full">
                            <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                                <Mail className="w-4 h-4 mr-2 text-indigo-600"/> Phone Number
                            </label>
                            <p className="w-1/2 px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200 text-center">
                                {lender.phone || ''}
                            </p>
                        </div>
                    </div>

                }

                <div className="flex gap-4 justify-center">
                    {getActionButtons()}
                </div>
            </form>
        </div>
    );
}