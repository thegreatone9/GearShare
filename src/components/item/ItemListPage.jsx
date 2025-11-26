import ItemCard from "./ItemCard.jsx";
import SearchAndFilter from "./SearchAndFilter.jsx";
import React, {useEffect, useState} from "react";
import {supabase} from "../../server/supabaseClient.js";
import {LISTING_STATUS} from "../util/Util.js";
import Loader from "../common/Loader.jsx";

export default function ItemListPage() {
    const HOTTEST_LIST_SIZE = 8;
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHottestListingData = async () => {
        setLoading(true);

        const { data: listingData, error: listingError } = await supabase
            .from('listings')
            .select('*')
            .eq('status', LISTING_STATUS.AVAILABLE)
            .limit(HOTTEST_LIST_SIZE);

        if (listingError) {
            console.error("Error fetching listings:", listingError);
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
        <div className="bg-indigo-circles font-inter antialiased p-5 rounded-xl">
            <SearchAndFilter setListings={setListings} setLoading={setLoading} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map(item => (
                    <ItemCard key={item.id} item={item}/>
                ))}
            </div>
        </div>
    );
}