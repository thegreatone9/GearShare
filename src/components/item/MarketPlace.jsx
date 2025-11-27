import React, {useEffect, useState} from "react";
import Loader from "../common/Loader.jsx";
import {supabase} from "../../server/supabaseClient.js";
import {LISTING_STATUS, TOAST_TYPE} from "../util/Util.js";
import {useToast} from "../AppContext.jsx";
import SearchAndFilter from "./SearchAndFilter.jsx";
import ItemCard from "./ItemCard.jsx";

export default function MarketplaceContent () {
    const HOTTEST_LIST_SIZE = 8;
    const {addToast} = useToast();
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);

    const fetchHottestListingData = async () => {
        setLoading(true);

        const {data: listingData, error: listingError} = await supabase
            .from('listings')
            .select('*')
            .eq('status', LISTING_STATUS.AVAILABLE)
            .limit(HOTTEST_LIST_SIZE);

        if (listingError) {
            addToast(TOAST_TYPE.ERROR, `Error fetching listings: ${listingError.message}`)
        }

        setListings(listingData || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchHottestListingData();

    }, []);

    if (loading) {
        return <Loader show={loading} message={'Loading Marketplace'}/>
    }

    return (
        <div className="py-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Discover Gear Near You</h3>
            <p className="text-gray-800">Start browsing thousands of items available for rent in your community.</p>
            <br/>
            <div className="bg-indigo-circles font-inter antialiased p-5 rounded-xl">
                <SearchAndFilter setListings={setListings} setLoading={setLoading}/>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listings.map(item => <ItemCard key={item.id} item={item}/>)}
                </div>
            </div>
        </div>
    );
}