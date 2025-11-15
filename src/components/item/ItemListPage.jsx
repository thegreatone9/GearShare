import ItemCard from "./ItemCard.jsx";
import SearchAndFilter from "./SearchAndFilter.jsx";
import React, {useEffect, useState} from "react";
import {supabase} from "../../server/supabaseClient.js";

export default function ItemListPage() {
    const HOTTEST_LIST_SIZE = 8;
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHottestListingData = async () => {
        setLoading(true);

        const { data: listingData, error: listingError } = await supabase
            .from('listings')
            .select('*')
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
        return <div className="p-8 text-center text-indigo-600">Loading Marketplace...</div>;
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