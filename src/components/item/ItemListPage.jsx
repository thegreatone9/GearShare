import ItemCard from "./ItemCard.jsx";
import SearchAndFilter from "./SearchAndFilter.jsx";
import React from "react";

export default function ItemListPage({setLoading, listings, setListings}) {
    return (
        <div className="bg-indigo-circles font-inter antialiased p-5 rounded-xl">
            <SearchAndFilter setListings={setListings} setLoading={setLoading}/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map(item => (
                    <ItemCard key={item.id} item={item}/>
                ))}
            </div>
        </div>
    );
}