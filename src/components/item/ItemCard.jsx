import {useNavigate} from "react-router-dom";
import {itemImageSrc, ROLE, TIME_UNIT} from "../util/Util.js";
import {useAuth} from "../AppContext.jsx";

export default function ItemCard({item}) {
    const navigate = useNavigate();
    const {authenticatedUser} = useAuth();

    const isForSale = item.listing_type === 'SELL';
    const isService = item.listing_type === 'SERVICE';

    const handleItemClick = function () {
        if (!authenticatedUser) {
            navigate('/auth');
            return;
        }

        if (isService) {
            navigate(`/service/${item.id}`);
        } else {
            navigate(`/item/${item.id}?role=${ROLE.CLIENT}`);
        }
    }

    const rating = item.rating || item.condition || '—';

    // Determine badge style
    const getBadge = () => {
        if (isService) return {label: 'SERVICE', cls: 'item-card__badge--service'};
        if (isForSale) return {label: 'FOR SALE', cls: 'item-card__badge--sale'};
        return {label: 'FOR RENT', cls: 'item-card__badge--rent'};
    };
    const badge = getBadge();

    return (
        <div
            onClick={handleItemClick}
            className="item-card group"
        >
            {/* Image area */}
            <div className="item-card__image-wrapper">
                <img
                    src={itemImageSrc(item.image_url, item.title)}
                    alt={item.title}
                    className="item-card__image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x280/CCCCCC/000000?text=Image+Error";
                    }}
                />
                <span className={`item-card__badge ${badge.cls}`}>
                    {badge.label}
                </span>
            </div>

            {/* Content area */}
            <div className="item-card__content">
                {/* Title + Rating */}
                <div className="item-card__header">
                    <h3 className="item-card__title">{item.title}</h3>
                    {!isService && (
                        <span className="item-card__rating">
                            <span className="item-card__star">★</span> {rating}
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="item-card__description">
                    {item.description || 'No description available.'}
                </p>

                {/* Location */}
                <p className="item-card__location">
                    <span className="item-card__location-icon">📍</span> {item.location}
                </p>

                {/* Price (hidden for services) */}
                {!isService && (
                    <div className="item-card__footer">
                        <div className="item-card__price">
                            {isForSale ? (
                                <span className="item-card__price-amount item-card__price-amount--sale">${item.price}</span>
                            ) : (
                                <>
                                    <span className="item-card__price-amount">${item.daily_rate}</span>
                                    <span className="item-card__price-unit">/{TIME_UNIT.DAY}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Service indicator in footer area */}
                {isService && (
                    <div className="item-card__footer">
                        <span className="text-sm font-medium text-orange-600">View Details →</span>
                    </div>
                )}
            </div>
        </div>
    );
}