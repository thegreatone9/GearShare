import React, {useState} from "react";
import {Link} from "react-router-dom";

export default function ModalItemDetails({ item, onClose }) {
    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">{item.title} Overview</h3>

            <div className="mb-4">
                <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-3"/>
                <p className="text-gray-700 mb-2"><strong>Location:</strong> {item.location || 'N/A'}</p>
                <p className="text-gray-700"><strong>Rate:</strong> ${item.price}/{item.unit}</p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                For detailed management or editing, please go to the full item page.
            </p>

            {/* Link to the full ItemForm page */}
            <Link
                to={`/item/${item.id}?role=LENDER`}
                onClick={onClose}
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition pointer-events-auto"
            >
                Manage/Edit Item Details
            </Link>
        </div>
    )
}