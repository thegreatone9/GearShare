import React, {useEffect, useState} from "react";
import {supabase} from "../../../server/supabaseClient.js";

export default function BorrowerDetails({ borrowerId, onClose }) {
    const [borrower, setBorrower] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        const fetchBorrower = async function () {
            const { data: borrowerData, error: borrowerError } = await supabase
                .from('accounts')
                .select('name, email')
                .eq('id', borrowerId)
                .single();

            if (borrowerError) {
                console.error("Error fetching borrower:", borrowerError);
            }

            setBorrower(borrowerData);
        }

        fetchBorrower()
            .then(() => setLoading(false));

    }, [borrowerId]);

    if (loading) {
        return <div className="p-8 text-center text-indigo-600">Loading Borrower Details...</div>;
    }

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">{borrower.name} Overview</h3>

            <div className="mb-4">
                <img src={borrower.image_url} alt={borrower.name} className="w-full h-48 object-cover rounded-lg mb-3"/>
                <p className="text-gray-700 mb-2"><strong>Name:</strong> {borrower.name}</p>
                <p className="text-gray-700"><strong>Email:</strong> {borrower.email}</p>
            </div>

            <div className="pt-4 flex justify-end space-x-3 bg-gray-50 -mb-6 p-6 rounded-b-xl">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                    Dismiss / Back
                </button>
            </div>
        </div>
    )
}