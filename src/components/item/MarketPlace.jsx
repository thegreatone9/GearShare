import ItemListPage from "./ItemListPage.jsx";

export default function MarketplaceContent () {
    return (
        <div className="py-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Discover Gear Near You</h3>
            <p className="text-gray-800">Start browsing thousands of items available for rent in your community.</p>
            <br/>
            <ItemListPage/>
        </div>
    );
}