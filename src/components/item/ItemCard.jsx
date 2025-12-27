import {useNavigate} from "react-router-dom";
import {itemImageSrc, ROLE, TIME_UNIT, upperCaseFirstLetter} from "../util/Util.js";
import {useAuth} from "../AppContext.jsx";

export default function ItemCard({item}) {
    const navigate = useNavigate();
    const {authenticatedUser} = useAuth();

    const handleItemClick = function () {
        if (authenticatedUser) {
            navigate(`/item/${item.id}?role=${ROLE.BORROWER}`);

        } else {
            navigate('/auth');
        }
    }

    return (
        <div
            onClick={handleItemClick}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer">
            <img
                src={itemImageSrc(item.image_url, item.title)}
                alt={item.title}
                className="w-full h-48 object-cover object-center"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/300x200/CCCCCC/000000?text=Image+Error";
                }}
            />
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">{item.title}</h2>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                        ${item.daily_rate}/{TIME_UNIT.DAY}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{item.location}</p>
                <div className="mt-2 flex items-center text-sm text-yellow-500">
                    <span className="mr-1">★</span> {item.condition}
                    <span className="ml-2 text-gray-500">· Available Now</span>
                </div>
            </div>
        </div>
    );
}