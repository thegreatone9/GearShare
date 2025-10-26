import ItemCard from "./ItemCard.jsx";
import SearchAndFilter from "./SearchAndFilter.jsx";
import {useState} from "react";

export default function ItemListPage({ listings }) {
    const [items, setItems] = useState(listings);

    return (
        <div className="bg-gray-100 font-inter antialiased pt-5">
            <SearchAndFilter/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                    <ItemCard key={item.id} item={item}/>
                ))}
            </div>
        </div>
    );
}