import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {Package, Shield} from 'lucide-react';
import {RENTAL_STATUS, REQUEST_STATUS} from "../util/Util.js";
import {supabase} from "../../server/supabaseClient.js";

export default function ItemForm({listings, setAppData, authenticatedUser}) {
    const navigate = useNavigate();
    const { id } = useParams(); // Renamed from 'id' to 'itemId' for clarity, based on the route definition

    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');

    // Convert itemId to a number for safe comparison with mock data
    const itemIdNum = parseInt(id);
    const isEditMode = !isNaN(itemIdNum); // Check if we have a valid numeric ID

    const [currentItem, setCurrentItem] = useState(null);
    const [itemState, setItemState] = useState(null);

    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isEditMode || !itemIdNum) {
            return;
        }

        const fetchItem = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', itemIdNum)
                .single();

            if (error || !data) {
                console.error(`Error fetching item ${itemIdNum}:`, error);

                setItemState({
                    title: '',
                    description: '',
                    price: '',
                    value: '',
                    unit: 'day',
                    imageUrl: "https://placehold.co/100x70/6366f1/ffffff?text=NEW"
                });

            } else {
                setCurrentItem(data);

                setItemState({
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price || '',
                    value: data.replacement_value || '', // Ensure snake_case matches DB
                    unit: data.unit || 'day',
                    imageUrl: data.image_url // Ensure snake_case matches DB
                });
            }

            setLoading(false);
        };

        fetchItem();

    }, [itemIdNum, isEditMode]);

    // 3. Handle data changes (for form inputs)
    const handleChange = (e) => {
        const { id, value } = e.target;

        setItemState(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    // Simplistic handling of file input (logging for MVP)
    const handleFileChange = (e) => {
        console.log("File selected:", e.target.files[0]?.name);
        // In a real app, this would upload the file and update itemState.imageUrl
    };

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
            const { error: listingError } = await supabase
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
            price: priceNum,
            replacement_value: valueNum,
            unit: itemState.unit,
            image_url: itemState.imageUrl
        };

        let dbError;

        if (isEditMode) {
            const { error } = await supabase
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

            const { error } = await supabase
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

    // If we are in edit mode and the item wasn't found (e.g., bad URL ID)
    if (isEditMode && !currentItem) {
        return <div className="py-8 text-center text-red-600">Listing not found. Invalid item ID.</div>;
    }

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {isEditMode ? `Edit Listing: ${itemState.title}` : 'List a New Item'}
            </h3>

            {statusMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-lg">
                    {statusMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-6">

                {/* Item Details */}
                <div className="space-y-4 border-b pb-6">
                    <h4 className="text-xl font-semibold text-indigo-700">1. Basic Item Information</h4>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Item Name /
                            Title</label>
                        <input
                            id="title"
                            type="text"
                            required
                            placeholder="e.g., DeWalt Cordless Drill Set"
                            value={itemState.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="description"
                               className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            rows="4"
                            required
                            placeholder="Describe condition, accessories included, and pickup details."
                            value={itemState.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                        ></textarea>
                    </div>
                </div>

                {/* Pricing and Value (CRITICAL for Policy) */}
                <div className="space-y-4 border-b pb-6">
                    <h4 className="text-xl font-semibold text-indigo-700">2. Pricing & Protection Policy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Daily Rental
                                Rate ($)</label>
                            <input
                                id="price"
                                type="number"
                                required
                                placeholder="e.g., 15"
                                value={itemState.price}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="value"
                                   className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                Replacement Value Estimate ($)
                                <Shield className="w-4 h-4 ml-2 text-red-500"
                                        title="Required for calculating security deposit"/>
                            </label>
                            <input
                                id="value"
                                type="number"
                                required
                                placeholder="e.g., 350 (Mid-Value Tier)"
                                value={itemState.value}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                            <p className="mt-1 text-xs text-gray-500">This determines the borrower's security deposit
                                amount.</p>
                        </div>
                    </div>
                </div>

                {/* Photos */}
                <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-indigo-700">3. Photos (Proof of Condition)</h4>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                        <label htmlFor="photos" className="cursor-pointer">
                            <input id="photos" type="file" accept="image/*" multiple className="hidden"
                                   onChange={handleFileChange}/>
                            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                            <p className="text-sm font-medium text-gray-700">Click to upload up to 5 photos.</p>
                            <p className="text-xs text-gray-500">Clear photos of item and accessories are required for
                                dispute resolution.</p>
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    {
                        [RENTAL_STATUS.PENDING_BORROW, RENTAL_STATUS.PENDING_LEND].includes(status) &&
                        <button
                            type="button"
                            value="delete"
                            onClick={(event) => handleDelete(event)}
                            className="flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                        >
                            {"Delete Item"}
                        </button>
                    }

                    <button
                        type="submit"
                        value="save"
                        className="flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                    >
                        {isEditMode ? "Save Changes" : "Publish Item & Start Earning"}
                    </button>
                </div>
            </form>
        </div>
    );
}