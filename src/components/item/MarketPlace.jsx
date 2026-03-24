import React, {useEffect, useState} from "react";
import Loader from "../common/Loader.jsx";
import Pagination from "../common/Pagination.jsx";
import {apiRequest, LISTING_STATUS, TOAST_TYPE} from "../util/Util.js";
import {useToast} from "../AppContext.jsx";
import SearchAndFilter from "./SearchAndFilter.jsx";
import ItemCard from "./ItemCard.jsx";

const ITEMS_PER_PAGE = 9;

export default function MarketplaceContent() {
    const {addToast} = useToast();
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchListingData = async () => {
        setLoading(true);

        const {data: listingData, error: listingError} = await apiRequest('/api/listingsWithAvailability',
            {
                params: {
                    status: LISTING_STATUS.ACTIVE,
                    available: true
                }
            })

        if (listingError) {
            addToast(TOAST_TYPE.ERROR, `Error fetching listings: ${listingError}`)
        }

        setListings(listingData || []);
        setCurrentPage(1);
        setLoading(false);
    }

    useEffect(() => {
        fetchListingData();
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedListings = listings.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of marketplace
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return <Loader show={loading} message={'Loading Marketplace'}/>
    }

    return (
        <div className="py-8">
            <h3 className="text-3xl font-bold text-indigo-600 mb-4">Discover Gear Near You</h3>
            <p className="text-gray-800">Start browsing thousands of items available for rent or purchase in your community.</p>
            <br/>
            <div className="bg-indigo-circles font-inter antialiased p-5 rounded-xl">
                <SearchAndFilter setListings={setListings} setLoading={setLoading}/>

                {/* Results count */}
                <p className="text-sm font-medium text-gray-700 mb-4 bg-white/80 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                    Showing {paginatedListings.length} of {listings.length} listings
                </p>

                {/* 3-column card grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                    {paginatedListings.map(item => <ItemCard key={item.id} item={item}/>)}
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}