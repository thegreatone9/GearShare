import React, {useEffect, useRef, useState} from 'react';
import {Download, User} from 'lucide-react';
import Modal from "../common/Modal.jsx";
import {fetchUsersByIds, fetchRequestById} from "../../services/service.js";
import Loader from "../common/Loader.jsx";
import {itemImageSrc, userImageSrc} from "../util/Util.js";
import {toPng} from "html-to-image";

const TransactionReceiptModal = ({isOpen, onClose, transaction}) => {
    const receiptRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrichedData = async () => {
            if (!isOpen || !transaction) {
                return;
            }

            setLoading(true);

            try {
                const {data: users, error: userFetchError} = await fetchUsersByIds(
                    [transaction.payer_id, transaction.payee_id],
                    'id, name, email, image_url'
                );

                if (userFetchError) {
                    throw userFetchError;
                }

                let requestData = {};
                if (transaction.request_id) {
                    const {data: req, error: reqError} = await fetchRequestById(transaction.request_id, 'start_date, end_date');

                    if (!reqError) {
                        requestData = req;
                    }
                }

                const payer = users.find(p => p.id === transaction.payer_id);
                const payee = users.find(p => p.id === transaction.payee_id);

                setDetails({
                    client: payer,
                    merchant: payee,
                    startDate: requestData.start_date,
                    endDate: requestData.end_date
                });

            } catch (err) {
                console.error("Error fetching receipt details:", err);

            } finally {
                setLoading(false);
            }
        };

        fetchEnrichedData();
    }, [isOpen, transaction]);

    if (!isOpen) {
        return;
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(amount || 0);
    };

    const handleDownload = async () => {
        if (!receiptRef.current) return;
        setIsDownloading(true);

        try {
            const dataUrl = await toPng(receiptRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                skipOnError: true
            });

            const link = document.createElement('a');
            link.download = `GearShare-Receipt-${transaction.id}.png`;
            link.href = dataUrl;
            link.click();

        } catch (err) {
            console.error("Failed to generate receipt:", err);
            alert("Could not download receipt. Please try again.");

        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Transaction Receipt"
            maxWidth="max-w-2xl"
        >
            <div className="bg-gray-50 flex flex-col h-full">

                {/* RECEIPT CONTENT */}
                <div id="receipt-content" ref={receiptRef} className="bg-white p-8 border-b border-gray-200">
                    {
                        loading
                            ?
                            <Loader show={loading} message={'Loading Transaction Details...'}/>
                            :
                            <>
                                {/* Header */}
                                <div className="flex justify-center items-center gap-20 mb-4 border-b border-gray-100 pb-6">
                                    <div>
                                        <h1 className="text-2xl font-black text-indigo-700 tracking-tight">GearShare</h1>
                                        <p className="text-sm text-gray-500 mt-1">Transaction ID: #{transaction.id}</p>
                                        <p className="text-sm text-gray-400">{new Date(transaction.created_at).toLocaleDateString()}</p>
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-green-100 text-green-700">
                                            {transaction.description}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="mb-2">
                                            <img src={itemImageSrc(transaction.listing?.image_url, transaction.listing?.title)}
                                                 alt={transaction.listing?.title}
                                                 className="w-20 rounded-lg object-cover border border-gray-200"/>
                                        </div>
                                        <p className=" text-gray-800 text-sm"><b>Item Title</b>: {transaction.listing?.title}</p>
                                    </div>
                                </div>

                                {/* Parties */}
                                <div className="flex justify-center items-center gap-8 mb-4">
                                    {/* Merchant */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                                            <User className="w-3 h-3 mr-1"/> Payee (Merchant)
                                        </h4>
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                                                <img src={userImageSrc(details.merchant?.name)}
                                                     className="w-full h-full object-cover" alt={details.merchant?.name}/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{details.merchant?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{details.merchant?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Client */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                                            <User className="w-3 h-3 mr-1"/> Payer (Client)
                                        </h4>
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                                                <img src={userImageSrc(details.client?.name)}
                                                     className="w-full h-full object-cover" alt={details.client?.name}/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{details.client?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{details.client?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Breakdown */}
                                <div className="space-y-3 mb-4">
                                    <div
                                        className="border-t border-gray-200 border-dashed pt-4 flex justify-between items-center">
                                        <span className="font-bold text-gray-800">Total Paid</span>
                                        <span
                                            className="text-xl font-black text-indigo-700">{formatCurrency(transaction.amount)}</span>
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                {
                                    !isDownloading &&
                                    <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-center gap-3">
                                        <button onClick={onClose}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                            Close
                                        </button>
                                        <button onClick={handleDownload} disabled={isDownloading}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                            {isDownloading ? "Generating Receipt..." : <><Download
                                                className="w-4 h-4 mr-2"/> Download</>}
                                        </button>
                                    </div>
                                }
                            </>
                    }
                </div>
            </div>
        </Modal>
    );
};

export default TransactionReceiptModal;