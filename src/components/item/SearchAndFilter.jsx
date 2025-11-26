import React, {useState} from 'react';
import {supabase} from '../../server/supabaseClient.js';
import {LISTING_CATEGORY, LISTING_STATUS, TOAST_TYPE} from "../util/Util.js";
import {useToast} from "../AppContext.jsx";

export default function SearchAndFilter({ setListings, setLoading }) {
    const {addToast} = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Category: All');

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        const hasSearchTerm = searchTerm.trim().length > 3;
        const hasLocation = searchLocation.trim().length > 3;
        const hasCategory = selectedCategory !== 'Category: All';

        if (!hasSearchTerm && !hasLocation && !hasCategory) {
            console.log("No search criteria provided. Skipping database query.");
            return;
        }

        setLoading(true);

        try {
            let query = supabase
                .from('listings')
                .select('*')
                .eq('status', LISTING_STATUS.AVAILABLE);

            if (hasSearchTerm) {
                query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            }

            if (hasLocation) {
                query = query.ilike('location', `%${searchLocation}%`);
            }

            if (hasCategory) {
                query = query.eq('category', selectedCategory);
            }

            const { data, error } = await query;

            if (error) {
                addToast(TOAST_TYPE.ERROR, `Error fetching filtered listings: ${error.message}`);
                setLoading(false);

                return;
            }

            setListings(data);

        } catch (err) {
            addToast(TOAST_TYPE.ERROR, `Search query failed: ${err.message}`);

        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row gap-4 items-center mb-8">
            <input
                type="search"
                placeholder="Item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-1/2"
            />
            <input
                type="search"
                placeholder="Location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-1/2"
            />
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white p-3 border border-gray-300 rounded-lg w-full md:w-auto text-gray-700"
            >
                <option>Category: All</option>
                {
                    Object.values(LISTING_CATEGORY).map(category => {
                        return <option key={category}>{category}</option>
                    })
                }
            </select>
            <button
                type="submit"
                className="p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white font-medium w-full md:w-auto transition">
                Search
            </button>
        </form>
    );
}