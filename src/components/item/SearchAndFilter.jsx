export default function SearchAndFilter() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row gap-4 items-center mb-8">
            <input
                type="search"
                placeholder="Search items, e.g., 'vacuum' or 'guitar'"
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-1/2"
            />
            <select className="bg-black p-3 border border-gray-300 rounded-lg w-full md:w-auto">
                <option>Category: All</option>
                <option>Tools</option>
                <option>Electronics</option>
                <option>Sports</option>
            </select>
            <select className="bg-black p-3 border border-gray-300 rounded-lg w-full md:w-auto">
                <option>Distance: 5 miles</option>
                <option>1 mile</option>
                <option>10 miles</option>
            </select>
            <button className="bg-black p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 w-full md:w-auto transition">
                Search
            </button>
        </div>
    );
}