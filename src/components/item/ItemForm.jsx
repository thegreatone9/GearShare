import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {AlertTriangle, CheckCircle, Mail, Package, Phone, Shield, User} from 'lucide-react';
import {
    BORROWER_ITEM_ACTIONS,
    formatDateStr,
    getStatusClasses,
    isEmptyString,
    LENDER_ITEM_ACTIONS,
    LISTING_CATEGORY,
    LISTING_CONDITION,
    LISTING_STATUS,
    parseDDMMYYYY,
    RENTAL_STATUS,
    REQUEST_STATUS,
    ROLE,
    TIME_UNIT,
    TOAST_TYPE
} from "../util/Util.js";
import {supabase} from "../../server/supabaseClient.js";
import {useAuth, useToast} from "../AppContext.jsx";
import Loader from "../common/Loader.jsx";
import {endOfDay, format, isAfter, isBefore, isSameDay, isWithinInterval, startOfDay} from "date-fns";
import {DayPicker} from "react-day-picker";
import classNames from "react-day-picker/style.module.css";

export default function ItemForm() {
    const {authenticatedUser} = useAuth();
    const {addToast} = useToast();
    const navigate = useNavigate();
    const {id} = useParams();

    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');
    const itemStatusForLender = searchParams.get('status');

    // Convert itemId to a number for safe comparison with mock data
    const itemIdNum = parseInt(id);

    const [currentItem, setCurrentItem] = useState(null);
    const [itemState, setItemState] = useState({
        title: '',
        description: '',
        location: '',
        category: '',
        condition: '',
        price: '',
        value: '',
        time_unit: '',
        image_url: '',
        status: ''
    });
    const [lender, setLender] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [canRequestBorrow, setCanRequestBorrow] = useState(false);
    const [requestDates, setRequestDates] = useState({
        start_date: '',
        end_date: ''
    });

    const [overallAvailableDates, setOverallAvailableDates] = useState({
        from: null,
        to: null
    });

    const [unavailableRanges, setUnavailableRanges] = useState([]);

    const selectedRangeForLender = {
        from: overallAvailableDates.from ? new Date(overallAvailableDates.from) : undefined,
        to: overallAvailableDates.to ? new Date(overallAvailableDates.to) : undefined,
    };

    const selectedRangeForBorrower = {
        from: requestDates.start_date ? new Date(requestDates.start_date) : undefined,
        to: requestDates.end_date ? new Date(requestDates.end_date) : undefined,
    };

    const handleDayClickForLender = (range) => {
        const newStartDate = range?.from ? format(range.from, 'yyyy-MM-dd') : '';
        const newEndDate = range?.to ? format(range.to, 'yyyy-MM-dd') : '';

        setOverallAvailableDates({
            from: newStartDate,
            to: newEndDate
        });
    };

    const handleDayClickForBorrower = (range) => {
        const newStartDate = range?.from ? format(range.from, 'yyyy-MM-dd') : '';
        const newEndDate = range?.to ? format(range.to, 'yyyy-MM-dd') : '';

        setRequestDates({
            start_date: newStartDate,
            end_date: newEndDate,
        });
    };

    const disabledDaysForLender = (day) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Rule 1: Disable past days (excluding today)
        if (isBefore(day, today) && !isSameDay(day, today)) {
            return true;
        }

        // Rule 2: Disable days that fall within any of the specifically UNAVAILABLE ranges
        for (const range of unavailableRanges) {
            if (isWithinInterval(day, { start: range.from, end: range.to })) {
                return true;
            }
        }

        return false;
    };

    const disabledDaysForBorrower = (day) => {
        const today = startOfDay(new Date());

        // Rule 1: Disable past days (excluding today)
        if (isBefore(day, today) && !isSameDay(day, today)) {
            return true;
        }

        // Rule 2: Disable days outside the overall availability window (if defined)
        const overallAvailableFrom = startOfDay(new Date(overallAvailableDates.from));
        const overallAvailableTo = startOfDay(new Date(overallAvailableDates.to));

        if (overallAvailableFrom && isBefore(day, overallAvailableFrom)) {
            return true;
        }
        if (overallAvailableTo && isAfter(day, overallAvailableTo)) {
            return true;
        }

        // Rule 3: Disable days that fall within any of the specifically UNAVAILABLE ranges
        for (const range of unavailableRanges) {
            const start = startOfDay(new Date(range.from));
            const end = endOfDay(new Date(range.to));

            if (isWithinInterval(day, { start: start, end: end })) {
                return true;
            }
        }

        return false;
    };

    const [statusMessage, setStatusMessage] = useState({type: '', field: '', text: ''});
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(searchParams.get('toast'));

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

                if ([RENTAL_STATUS.PENDING_BORROW].includes(itemStatusForLender)) {
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

        } else if (role === ROLE.BORROWER) {
            buttonProps = [
                {
                    label: "Back",
                    action: "BACK",
                    classes: `${commonClasses} bg-gray-200 hover:bg-gray-500 text-black focus:ring-gray-900`,
                    onClick: (event) => {
                        event.preventDefault();
                        navigate('/marketplace');
                    }
                }];

            if (canRequestBorrow) {
                buttonProps.push({
                    label: "Request Borrow",
                    action: BORROWER_ITEM_ACTIONS.REQUEST_BORROW,
                    classes: `${commonClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`,
                    onClick: (event) => handleBorrowRequest(event)
                })
            }
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
            setLoading(false);
            setEditMode(true);

            return;
        }

        const fetchItem = async () => {
            setLoading(true);
            setEditMode(false);
            setCanRequestBorrow(false);
            setStatusMessage({type: '', field: '', text: ''});

            const {data: item, error} = await supabase
                .from('listings')
                .select('*')
                .eq('id', itemIdNum)
                .single();

            let itemUnavailableRanges = [];

            if (error || !item) {
                console.error(`Error fetching item ${itemIdNum}:`, error);

                setItemState({
                    title: '',
                    description: '',
                    location: '',
                    category: '',
                    condition: '',
                    price: '',
                    value: '',
                    time_unit: '',
                    image_url: `https://placehold.co/100x70/6366f1/ffffff?text=${itemState.title}`
                });

            } else {
                setCurrentItem(item);

                setItemState({
                    title: item.title || '',
                    description: item.description || '',
                    price: item.price || '',
                    value: item.replacement_value || '',
                    location: item.location || '',
                    category: item.category || '',
                    condition: item.condition || '',
                    time_unit: item.time_unit,
                    image_url: item.image_url || `https://placehold.co/100x70/6366f1/ffffff?text=${itemState.title}`
                });

                const {data: listingsAvailableRanges, error} = await supabase
                    .from('listings_available_dates')
                    .select('unavailable_ranges, overall_available_range')
                    .eq('listing_id', itemIdNum)
                    .single();

                setOverallAvailableDates({
                    from: new Date(listingsAvailableRanges.overall_available_range.from),
                    to: new Date(listingsAvailableRanges.overall_available_range.to)
                });

                setUnavailableRanges(listingsAvailableRanges.unavailable_ranges.map(range => ({
                    from: new Date(range.from),
                    to: new Date(range.to)
                })));

                itemUnavailableRanges = listingsAvailableRanges.unavailable_ranges;
            }

            if (role === ROLE.LENDER) {
                setEditMode(!isNaN(itemIdNum));

            } else if (role === ROLE.BORROWER) {
                const {data: available, error} = await supabase.rpc('is_item_available', {
                    r_listing_id: item.id,
                    r_borrower_id: authenticatedUser.id
                });

                if (error) {
                    throw new Error(`Error checking request existence for borrower: ${error.message}`);
                }

                setCanRequestBorrow(available);

                const {data: lenderData, error: lenderFetchError} = await supabase
                    .from('accounts')
                    .select('id, name, email, image_url')
                    .eq('id', item.owner_id)
                    .single();

                if (lenderFetchError) {
                    throw new Error("There was an error fetching Lender Details!");
                }

                setLender(lenderData);

                if (item && item.owner_id !== authenticatedUser.id) {
                    const {data: requestDates, error: requestDatesError} = await supabase
                        .from('requests')
                        .select('start_date, end_date')
                        .eq('listing_id', itemIdNum)
                        .eq('borrower_id', authenticatedUser.id)
                        .eq('status', REQUEST_STATUS.ACTIVE);

                    if (requestDatesError) {
                        throw new Error(`There was an error fetching Request Dates!`);
                    }

                    itemUnavailableRanges.push(
                        ...requestDates.map(date => ({
                            to: date.end_date,
                            from: date.start_date
                        }))
                    );

                    setUnavailableRanges(itemUnavailableRanges);
                }
            }

            setLoading(false);
        };

        fetchItem()
            .catch(error => addToast(TOAST_TYPE.ERROR, `Error: ${error.message}`));

    }, [itemIdNum]);

    useEffect(() => {
        setStatusMessage({type: '', field: '', text: ''});

        if (!currentItem || role === ROLE.LENDER || canRequestBorrow) {
            return;
        }

        const statusMessageText = currentItem.owner_id === authenticatedUser.id
            ? 'You have listed this Item for Rent as Owner'
            : 'No Dates Available to borrow this Item';

        setStatusMessage({
            type: 'warning',
            field: '',
            text: statusMessageText
        });

    }, [canRequestBorrow, currentItem]);

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

        setStatusMessage({type: '', field: '', text: ''});

        const rentStartDate = requestDates.start_date;
        const rentEndDate = requestDates.end_date;

        if (!rentStartDate || !rentEndDate) {
            setStatusMessage({
                type: 'error',
                field: 'rent_dates',
                text: 'Both Start Date and End Date must be provided.'
            });
            return;
        }

        const startDateObj = parseDDMMYYYY(rentStartDate);
        const endDateObj = parseDDMMYYYY(rentEndDate);

        if (startDateObj.getTime() >= endDateObj.getTime()) {
            setStatusMessage({type: 'error', field: 'rent_dates', text: 'Start Date must be before End Date.'});
            return;
        }

        try {
            const {error: requestError} = await supabase
                .from('requests')
                .insert([
                    {
                        listing_id: itemIdNum,
                        borrower_id: authenticatedUser.id,
                        lender_id: lender.id,
                        status: REQUEST_STATUS.ACTIVE,
                        date: new Date().toISOString(),
                        start_date: rentStartDate,
                        end_date: rentEndDate
                    }
                ]);

            if (requestError) {
                throw new Error(`Failed to request borrowing of listing: ${requestError.message}`);
            }

            setTimeout(() => {
                const toastMessage = `You have requested to borrow: ${itemState.title}!`;
                navigate(`/item/${itemIdNum}?role=${role}&toast=${toastMessage}`, {replace: true});
                window.location.reload();

            }, 500);

        } catch (error) {
            addToast(TOAST_TYPE.ERROR, `Request to Borrow Error: ${error.message}`);
        }
    }

    const handleDelete = async function (event) {
        event.preventDefault();

        try {
            //Delete pending requests associated with the listing.
            const {deleteError} = await supabase.rpc('delete_listing_and_requests', {
                r_listing_id: itemIdNum,
                active_status: REQUEST_STATUS.ACTIVE
            });

            if (deleteError) {
                throw new Error(`Failed to delete listing: ${deleteError.message}`);
            }

            setTimeout(() => {
                navigate('/lender');
            }, 100);

        } catch (error) {
            addToast(TOAST_TYPE.ERROR, `Deletion Error: ${error.message}`)
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
            condition: itemState.condition,
            price: priceNum,
            replacement_value: valueNum,
            time_unit: itemState.time_unit || TIME_UNIT.DAY,
            image_url: itemState.image_url || `https://placehold.co/100x70/6366f1/ffffff?text=${itemState.title}`,
            status: itemState.status || LISTING_STATUS.ACTIVE,
        };

        try {
            const { data: updatedListing, error: dbError } = await supabase.rpc('upsert_listing_with_availability', {
                p_owner_id: authenticatedUser.id,
                p_listing_id: itemIdNum,
                p_listing_data: itemData,
                p_overall_available_range: overallAvailableDates,
                p_unavailable_ranges: unavailableRanges
            });

            if (dbError) {
                addToast(TOAST_TYPE.ERROR, `Database submission error: ${dbError.message}`);

            } else {
                setTimeout(() => navigate(`/lender?toast=Successfully Updated Listing: ${itemState.title}`), 500);
            }

        } catch (err) {
            console.error('RPC call failed:', err.message);
        }
    };

    if (loading) {
        return <Loader show={loading} message={'Loading Item Details'}/>
    }

    if (editMode && itemIdNum && !currentItem) {
        return <div className="py-8 text-center text-red-600">Listing not found. Invalid item ID.</div>;
    }

    if (!isEmptyString(toastMessage)) {
        console.log('RENDER TOAST');

        setTimeout(() => {
            addToast(TOAST_TYPE.SUCCESS, toastMessage);

        }, 0);

        setToastMessage(null);
    }

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {editMode ? `Edit Listing: ${itemIdNum && itemState.title}` : `Viewing Listing: ${itemState.title}`}
            </h3>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-6">
                {statusMessage.text && (
                    <div
                        className={`p-4 rounded-lg border-l-4 font-medium ${getStatusClasses(statusMessage.type)} flex items-center`}>
                        {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3"/> :
                            <AlertTriangle className="w-5 h-5 mr-3"/>}
                        {statusMessage.text}
                    </div>
                )}
                <div className="space-y-4 pb-6">
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
                            <p id="title"
                               className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                {itemState.title}
                            </p>
                        )}
                    </div>

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
                            <p id="location"
                               className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                {itemState.location}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                                >
                                    <option value="" disabled>Select a Category</option>
                                    {
                                        Object.values(LISTING_CATEGORY).map(category => {
                                            return <option key={category} value={category}>{category}</option>
                                        })
                                    }
                                </select>
                            ) : (
                                <p className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                    {itemState.category}
                                </p>
                            )}
                        </div>

                        {/* Condition Dropdown */}
                        <div>
                            <label htmlFor="condition"
                                   className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                            {editMode ? (
                                <select
                                    id="condition"
                                    required
                                    value={itemState.condition}
                                    onChange={handleChange}
                                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                                >
                                    <option value="" disabled>Select a Condition</option>
                                    {
                                        Object.values(LISTING_CONDITION).map(condition => {
                                            return <option key={condition} value={condition}>{condition}</option>
                                        })
                                    }
                                </select>
                            ) : (
                                <p id="location"
                                   className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                    {itemState.condition}
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
                            <p id="description"
                               className="w-full px-4 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 whitespace-pre-wrap">
                                <i>{itemState.description ? itemState.description : 'No description provided for this item'}</i>
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-4 pb-6">
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
                                <p id="price"
                                   className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
                                    ${itemState.price} / {itemState.time_unit}
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
                                <p id="value"
                                   className="w-full px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200">
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
                                    for dispute resolution.</p>
                            </label>
                        </div>
                    ) : (
                        <div className="rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <img
                                id="photos"
                                src={itemState.image_url || "https://placehold.co/600x400/cccccc/000000?text=No+Image"}
                                alt={`Photo of ${itemState.title}`}
                                className="w-full h-80 object-cover"
                            />
                        </div>
                    )}
                </div>

                {
                    role === ROLE.LENDER &&
                    <div className="space-y-4 pb-6 mx-auto flex flex-col">
                        <h4 className="text-xl font-semibold text-indigo-700 text-center">4. Available Dates</h4>

                        {
                            statusMessage.type === 'error' && statusMessage.field === 'rent_dates' &&
                            <p className="font-medium text-red-500 mb-2 flex items-center justify-center">
                                Invalid: {statusMessage.text}
                            </p>
                        }

                        {/* Display selected range */}
                        <div className="text-gray-700 text-center">
                            <div className="text-gray-700 text-center">
                                {overallAvailableDates.from && overallAvailableDates.to ? (
                                    <>
                                        <span className="font-bold">{formatDateStr(overallAvailableDates.from)}</span> to{' '}
                                        <span className="font-bold">{formatDateStr(overallAvailableDates.to)}</span>
                                    </>
                                ) : (
                                    editMode && <span>Please select a date range.</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <DayPicker
                                required={editMode}
                                mode="range"
                                selected={selectedRangeForLender}
                                onSelect={handleDayClickForLender}
                                disabled={disabledDaysForLender}
                                defaultMonth={overallAvailableDates.from || new Date()}
                                showOutsideDays={false}
                                classNames={classNames}
                            />
                        </div>
                    </div>
                }

                {/* Lender Details */}
                {
                    role === ROLE.BORROWER && lender &&
                    <div className="space-y-4 pb-6 mx-auto flex flex-col items-center">
                        <h4 className="text-xl font-semibold text-indigo-700">4. Lender Details</h4>

                        <div className="flex flex-col items-center w-full">
                            <img src={lender.image_url} alt={lender.name}
                                 className="w-fit h-25 m-auto object-cover rounded-lg"/>
                        </div>

                        <div className="flex flex-col items-center w-full">
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                                <User className="w-4 h-4 mr-2 text-indigo-600"/> Full Name
                            </label>
                            <p className="w-1/2 px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200 text-center">
                                {lender.name}
                            </p>
                        </div>

                        <div className="flex flex-col items-center w-full">
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                                <Mail className="w-4 h-4 mr-2 text-indigo-600"/> Email Address
                            </label>
                            <p className="w-1/2 px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200 text-center">
                                {lender.email}
                            </p>
                        </div>

                        <div className="flex flex-col items-center w-full">
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                                <Phone className="w-4 h-4 mr-2 text-indigo-600"/> Phone Number
                            </label>
                            <p className="w-1/2 px-4 py-3 bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200 text-center">
                                {lender.phone || 'N/A'}
                            </p>
                        </div>
                    </div>

                }

                {
                    role === ROLE.BORROWER && authenticatedUser.id !== currentItem.owner_id &&
                    <div className="space-y-4 pb-6 mx-auto flex flex-col">
                        <h4 className="text-xl font-semibold text-indigo-700 text-center">
                            5. Request Rent Dates
                        </h4>
                        {
                            statusMessage.type === 'error' && statusMessage.field === 'rent_dates' &&
                            <p className="font-medium text-red-500 mb-2 flex items-center justify-center">
                                Invalid: {statusMessage.text}
                            </p>
                        }

                        {/* Display selected range */}
                        <div className="text-gray-700 text-center">
                            <div className="text-gray-700 text-center">
                                {requestDates.start_date && requestDates.end_date ? (
                                    <>
                                        <span className="font-bold">{formatDateStr(requestDates.start_date)}</span> to{' '}
                                        <span className="font-bold">{formatDateStr(requestDates.end_date)}</span>
                                    </>
                                ) : (
                                    editMode && <span>Please select a date range.</span>
                                )}
                            </div>
                        </div>

                        {
                            canRequestBorrow &&
                            <div className="flex justify-center">
                                <DayPicker
                                    required={editMode}
                                    mode="range"
                                    selected={selectedRangeForBorrower}
                                    onSelect={handleDayClickForBorrower}
                                    disabled={disabledDaysForBorrower}
                                    defaultMonth={overallAvailableDates.from}
                                    classNames={classNames}
                                    showOutsideDays={false}
                                    startMonth={new Date(
                                        overallAvailableDates.from.getFullYear(),
                                        overallAvailableDates.from.getMonth(),
                                        1
                                    )}
                                    endMonth={new Date(
                                        overallAvailableDates.to.getFullYear(),
                                        overallAvailableDates.to.getMonth(),
                                        1
                                    )}
                                />
                            </div>
                        }
                    </div>
                }

                <div className="flex gap-4 justify-center">
                    {getActionButtons()}
                </div>
            </form>
        </div>
    );
}