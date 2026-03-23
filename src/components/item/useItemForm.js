import {useEffect, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {
    fetchListingById, fetchAvailability, fetchUserById, fetchActiveRequestDates
} from "../../services/service.js";
import {useAuth, useToast} from "../AppContext.jsx";
import {endOfDay, format, isAfter, isBefore, isSameDay, isWithinInterval, startOfDay} from "date-fns";
import {apiRequest, LISTING_STATUS, REQUEST_STATUS, ROLE, TIME_UNIT, TOAST_TYPE} from "../util/Util.js";

export function useItemForm() {
    const { authenticatedUser } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const role = searchParams.get('role');
    const toastParam = searchParams.get('toast');
    const itemIdNum = parseInt(id);

    // State
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [canRequestBorrow, setCanRequestBorrow] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [lender, setLender] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ type: '', field: '', text: '' });

    // Flattened Item State
    const [itemState, setItemState] = useState({
        title: '', description: '', location: '', category: '',
        condition: '', replacement_value: '', daily_rate: '', image_url: {},
        status: '', owner_id: null
    });

    // Date State
    const [overallAvailableDates, setOverallAvailableDates] = useState({ from: null, to: null });
    const [requestDates, setRequestDates] = useState({ start_date: '', end_date: '' });
    const [unavailableRanges, setUnavailableRanges] = useState([]);

    // --- Initialization & Fetching ---
    useEffect(() => {
        if (toastParam) {
            // Using setTimeout to avoid render cycle conflicts
            setTimeout(() => addToast(TOAST_TYPE.SUCCESS, toastParam), 0);
        }

        const init = async () => {
            setLoading(true);

            if (!itemIdNum) {
                setEditMode(true);
                setLoading(false);
                return;
            }

            try {
                // Fetch Listing
                const { data: item, error } = await fetchListingById(itemIdNum);

                if (error || !item) {
                    throw new Error("Item not found");
                }

                setCurrentItem(item);
                setItemState({
                    ...item,
                    image_url: item.image_url || { url_1: '', url_2: '', url_3: '' }
                });

                // Fetch Availability
                const { data: availability } = await fetchAvailability(itemIdNum);

                if (availability) {
                    setOverallAvailableDates({
                        from: new Date(availability.overall_available_range.from),
                        to: new Date(availability.overall_available_range.to)
                    });
                    setUnavailableRanges(availability.unavailable_ranges.map(r => ({
                        from: new Date(r.from),
                        to: new Date(r.to)
                    })));
                }

                // Logic Branch: Lender vs Borrower
                if (item.owner_id === authenticatedUser.id) {
                    setEditMode(true);

                } else {
                    await fetchBorrowerViewData(item, availability?.unavailable_ranges || []);
                }

            } catch (error) {
                console.error(error);
                addToast(TOAST_TYPE.ERROR, `Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [itemIdNum, role]);

    useEffect(() => {
        // Clear message initially
        setStatusMessage({ type: '', field: '', text: '' });

        // Exit early if logic doesn't apply (e.g. data not loaded, wrong role, or actually borrowable)
        if (!currentItem || role === ROLE.LENDER || canRequestBorrow) {
            return;
        }

        // Determine why it's unavailable
        const statusMessageText = currentItem.owner_id === authenticatedUser.id
            ? 'You have listed this Item for Rent as Owner'
            : 'No Dates Available to borrow this Item';

        // Set the warning banner
        setStatusMessage({
            type: 'warning',
            field: '',
            text: statusMessageText
        });

    }, [canRequestBorrow, currentItem, authenticatedUser.id, role]);


    // Helper to fetch extra data if viewing as Borrower
    const fetchBorrowerViewData = async (item, existingUnavailable) => {
        // Get Lender Details
        const { data: lenderData } = await fetchUserById(item.owner_id, 'id, name, email, image_url, phone');

        setLender(lenderData);

        if (item.owner_id !== authenticatedUser.id) {
            // Get Existing Requests to block dates
            const { data: requestDates } = await fetchActiveRequestDates(item.id, authenticatedUser.id, REQUEST_STATUS.ACTIVE);

            const newUnavailable = [...existingUnavailable];
            if (requestDates) {
                newUnavailable.push(...requestDates.map(d => ({ to: d.end_date, from: d.start_date })));
            }

            // Convert to Date objects for local state
            setUnavailableRanges(newUnavailable.map(r => ({ from: new Date(r.from), to: new Date(r.to) })));

            // Check API availability
            const { data: available } = await apiRequest('/api/checkAvailability', {
                params: { listingId: item.id, borrowerId: authenticatedUser.id }
            });

            setCanRequestBorrow(available);
        }
    };

    // --- Event Handlers ---
    const handleChange = (e) => {
        const { id, value } = e.target;
        setItemState(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        console.log("File selected:", e.target.files[0]?.name);
        // Add actual upload logic here
    };

    // Date Picker Helpers
    const selectedRangeForLender = {
        from: overallAvailableDates.from ? new Date(overallAvailableDates.from) : undefined,
        to: overallAvailableDates.to ? new Date(overallAvailableDates.to) : undefined,
    };

    const selectedRangeForBorrower = {
        from: requestDates.start_date ? new Date(requestDates.start_date) : undefined,
        to: requestDates.end_date ? new Date(requestDates.end_date) : undefined,
    };

    const handleDayClickForLender = (range) => {
        setOverallAvailableDates({
            from: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
            to: range?.to ? format(range.to, 'yyyy-MM-dd') : ''
        });
    };

    const handleDayClickForBorrower = (range) => {
        setRequestDates({
            start_date: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
            end_date: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
        });
    };

    // Date Logic (Extracted)
    const disabledDaysForLender = (day) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isBefore(day, today) && !isSameDay(day, today)) {
            return true;
        }

        return unavailableRanges.some(range => isWithinInterval(day, { start: range.from, end: range.to }));
    };

    const disabledDaysForBorrower = (day) => {
        const today = startOfDay(new Date());
        if (isBefore(day, today) && !isSameDay(day, today)) return true;

        const overallFrom = overallAvailableDates.from ? startOfDay(new Date(overallAvailableDates.from)) : null;
        const overallTo = overallAvailableDates.to ? startOfDay(new Date(overallAvailableDates.to)) : null;

        if (overallFrom && isBefore(day, overallFrom)) return true;
        if (overallTo && isAfter(day, overallTo)) return true;

        return unavailableRanges.some(range => {
            return isWithinInterval(day, { start: startOfDay(new Date(range.from)), end: endOfDay(new Date(range.to)) });
        });
    };

    // --- Actions ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateItemOverallAvailableDates()) {
            return;
        }

        try {
            const itemData = {
                ...itemState,
                daily_rate: parseFloat(itemState.daily_rate),
                replacement_value: parseFloat(itemState.replacement_value),
                status: itemState.status || LISTING_STATUS.ACTIVE,
                time_unit: itemState.time_unit || TIME_UNIT.DAY
            };

            const { error: dbError } = await apiRequest('/api/upsertListing', {
                method: 'POST',
                body: {
                    ownerId: authenticatedUser.id,
                    listingId: itemIdNum,
                    listingData: itemData,
                    overallAvailableRange: overallAvailableDates,
                    unavailableRanges: unavailableRanges
                }
            });

            if (dbError) {
                throw new Error(dbError);
            }

            navigate(`/lender?toast=Successfully Updated Listing: ${itemState.title}`);

        } catch (err) {
            addToast(TOAST_TYPE.ERROR, `Error: ${err.message}`);
        }
    };

    const handleBorrowRequest = async (e) => {
        e.preventDefault();
        const { start_date, end_date } = requestDates;
        if (!start_date || !end_date) {
            setStatusMessage({ type: 'error', field: 'rent_dates', text: 'Select start and end dates.' });
            return;
        }

        try {
            const { error } = await apiRequest('/api/requestItem', {
                method: 'POST',
                body: {
                    listingId: itemIdNum,
                    borrowerId: authenticatedUser.id,
                    lenderId: lender.id,
                    status: REQUEST_STATUS.ACTIVE,
                    date: new Date().toISOString(),
                    startDate: start_date,
                    endDate: end_date
                }
            });

            if (error) throw new Error(error);
            navigate(`/item/${itemIdNum}?role=${role}&toast=Request Sent!`, { replace: true });
            window.location.reload();

        } catch (error) {
            addToast(TOAST_TYPE.ERROR, `Error: ${error.message}`);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            const { deleteError } = await apiRequest('/api/deleteListingWithRequests', {
                method: 'POST',
                params: { userId: authenticatedUser.id, listingId: itemIdNum, activeStatus: REQUEST_STATUS.ACTIVE }
            });

            if (deleteError) throw new Error(deleteError.message);
            navigate('/lender');

        } catch (error) {
            addToast(TOAST_TYPE.ERROR, `Deletion Error: ${error.message}`);
        }
    };

    const validateItemOverallAvailableDates = function () {
        if (role !== ROLE.LENDER) return true;

        // 2. Check if dates exist
        if (!overallAvailableDates.from || !overallAvailableDates.to) {
            setStatusMessage({
                type: 'error',
                field: 'rent_dates',
                text: 'Please select a valid date range.'
            });
            return false;
        }

        // 3. Check for past dates
        const endDate = new Date(overallAvailableDates.to);
        const fromDate = new Date(overallAvailableDates.from);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to midnight

        if (fromDate < today) {
            setStatusMessage({
                type: 'error',
                field: 'rent_dates',
                text: 'Availability cannot start in the past.'
            });
            return false;
        }

        if (endDate < today) {
            setStatusMessage({
                type: 'error',
                field: 'rent_dates',
                text: 'Availability cannot end in the past.'
            });
            return false;
        }

        return true;
    };

    return {
        authenticatedUser, loading, role, editMode, itemState, lender, statusMessage, canRequestBorrow,
        overallAvailableDates, requestDates,
        selectedRangeForLender, selectedRangeForBorrower,
        handleChange, handleFileChange,
        handleDayClickForLender, handleDayClickForBorrower,
        disabledDaysForLender, disabledDaysForBorrower,
        handleSubmit, handleDelete, handleBorrowRequest, navigate
    };
}