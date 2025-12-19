import React, {useEffect, useState} from 'react';
import {useAuth} from "../AppContext.jsx";
import Loader from "../common/Loader.jsx";
import {apiRequest} from "../util/Util.js";

export default function Transactions() {
    const {authenticatedUser} = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authenticatedUser) {
            return;
        }

        async function fetchTransactions() {
            try {
                const {data} = await apiRequest(`/api/transactions?userId=${authenticatedUser.id}`);

                setTransactions(data);

            } catch (err) {
                console.error("Failed to load transactions", err);

            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();

    }, []);

    // Helper to style the money amount based on flow
    const getTransactionStyle = (tx) => {
        // If I am the PAYEE (receiving money), it's Green/Income
        const isIncome = tx.payee_id === authenticatedUser.id;

        if (isIncome) {
            return {
                amountSign: '+',
                colorClass: 'text-green-700 bg-green-100 border-green-200',
                amountClass: 'text-green-700'
            };
        }

        // If I am the PAYER (sending money), it's Red/Expense
        return {
            amountSign: '-',
            colorClass: 'text-red-700 bg-red-50 border-red-200',
            amountClass: 'text-red-600'
        };
    };

    // Helper to format the transaction type for display
    const formatType = (type) => {
        return type.replace(/_/g, ' '); // e.g. "SECURITY_DEPOSIT" -> "SECURITY DEPOSIT"
    };

    const openReceiptModal = function () {

    }

    if (loading) {
        return <Loader show={loading} message={'Loading Ledger...'}/>
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h3 className="text-3xl font-bold text-gray-800">Transaction History</h3>

            {transactions.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No transactions found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx) => {
                        const style = getTransactionStyle(tx);
                        // Access nested data safely (assuming query joins rentals -> listings)
                        const itemTitle = tx.rentals?.requests?.listings?.title || "Unknown Item";
                        const itemImage = tx.rentals?.requests?.listings?.image_url || "/placeholder.jpg";

                        return (
                            <div
                                key={tx.id}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border border-gray-200 bg-white rounded-xl hover:shadow-md transition w-full gap-4"
                            >
                                {/* Item & Transaction Details (Left Side) */}
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={itemImage}
                                        alt={itemTitle}
                                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 bg-gray-50"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{itemTitle}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="uppercase text-xs font-bold tracking-wide">
                                                {formatType(tx.type)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Badge (Right Side) */}
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`px-4 py-2 text-sm font-bold rounded-lg border ${style.colorClass}`}>
                                        {style.amountSign} ${Number(tx.amount).toFixed(2)}
                                    </span>

                                    <button
                                        onClick={() => openReceiptModal(tx)}
                                        className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Receipt
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}