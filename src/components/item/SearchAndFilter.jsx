import React, {useEffect, useState} from 'react';
import {supabase} from '../../server/supabaseClient.js';
import {isEmptyString, LISTING_CATEGORY, LISTING_STATUS, TOAST_TYPE} from "../util/Util.js";
import {useToast} from "../AppContext.jsx";
import {clearAllSessionVariables, retrieveSessionVariable, saveSessionVariable} from "../util/SessionUtil.js";

function SearchAndFilter({ setListings, setLoading }) {
    const {addToast} = useToast();
    const [searchTerm, setSearchTerm] = useState(
        retrieveSessionVariable('searchTerm') || ''
    );
    const [searchLocation, setSearchLocation] = useState(
        retrieveSessionVariable('searchLocation') || ''
    );
    const [selectedCategory, setSelectedCategory] = useState(
        retrieveSessionVariable('selectedCategory') || ''
    );

    useEffect(() => {
        window.addEventListener('beforeunload', clearAllSessionVariables);

        return () => window.removeEventListener('beforeunload', clearAllSessionVariables);

    }, []);

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        const hasSearchTerm = searchTerm.trim().length > 3;
        const hasLocation = searchLocation.trim().length > 3;
        const hasCategory = !isEmptyString(selectedCategory) && selectedCategory !== LISTING_CATEGORY.ANY;

        setLoading(true);

        try {
            let query = supabase
                .from('listings_with_availability')
                .select('*')
                .eq('status', LISTING_STATUS.ACTIVE);

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
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    saveSessionVariable('searchTerm', e.target.value);
                }}
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-1/2"
            />
            <input
                type="search"
                placeholder="Location..."
                value={searchLocation}
                onChange={(e) => {
                    setSearchLocation(e.target.value);
                    saveSessionVariable('searchLocation', e.target.value);
                }}
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-1/2"
            />
            <select
                value={selectedCategory}
                onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    saveSessionVariable('selectedCategory', e.target.value);
                }}
                className="bg-white p-3 border border-gray-300 rounded-lg w-full md:w-auto text-gray-700"
            >
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

export default React.memo(SearchAndFilter);