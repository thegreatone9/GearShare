import React from "react";
import {itemImageSrc, TIME_UNIT} from "../util/Util.js";

export default function ModalItemDetails({ item, role, onClose }) {
    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">{item.title} Overview</h3>

            <div className="mb-4">
                <img src={itemImageSrc(item.image_url, item.title)} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-3"/>
                <p className="text-gray-700 mb-2"><strong>Location:</strong> {item.location || 'N/A'}</p>
                <p className="text-gray-700"><strong>Rate:</strong> ${item.daily_rate}/{TIME_UNIT.DAY}</p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                For detailed management or editing, please go to the {' '}
                <a
                    href={`/item/${item.id}?role=${role}`}
                    className="text-indigo-600 underline hover:text-indigo-800"
                >
                    full item page
                </a>.
            </p>
        </div>
    )
}