import React, {useEffect, useState} from 'react';
import {AlertTriangle, CheckCircle, X} from 'lucide-react';
import {useToast} from "../AppContext.jsx";
import {isEmptyString, TOAST_TYPE} from "../util/Util.js";
import {useLocation, useSearchParams} from "react-router-dom";

export default function ToastContainer () {
    const location = useLocation();
    const { toast, addToast, removeToast } = useToast();
    const [searchParams] = useSearchParams();
    const [searchParamToastMessage, setSearchParamToastMessage] = useState(null);

    useEffect(() => {
        setSearchParamToastMessage(searchParams.get('toast'));

    }, [location]);

    const getToastStyles = (type) => {
        switch (type) {
            case TOAST_TYPE.SUCCESS:
                return { icon: CheckCircle, className: 'bg-green-500' };
            case TOAST_TYPE.ERROR:
                return { icon: AlertTriangle, className: 'bg-red-500' };
            case TOAST_TYPE.WARNING:
                return { icon: AlertTriangle, className: 'bg-yellow-500' };
            case TOAST_TYPE.INFO:
            default:
                return { icon: AlertTriangle, className: 'bg-blue-500' };
        }
    };

    if (!isEmptyString(searchParamToastMessage)) {
        setSearchParamToastMessage(null);
        setTimeout(() => {
            addToast(TOAST_TYPE.INFO, searchParamToastMessage);

        }, 500);

        return;
    }

    if (toast === null || toast === undefined) {
        return;
    }

    const { icon: Icon, className } = getToastStyles(toast.type);

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] space-y-3 pointer-events-none">
            <div
                className={`pointer-events-auto max-w-sm w-full shadow-lg rounded-lg ${className} text-white p-4 flex items-center transform transition-transform duration-300 ease-out translate-x-0 opacity-100`}
                role="alert"
            >
                <Icon className="w-5 h-5 flex-shrink-0 mr-3" />

                <div className="flex-grow text-sm font-medium">
                    {toast.message}
                </div>

                <button
                    onClick={() => removeToast()}
                    className="p-1 ml-4 rounded-full hover:bg-white/20 transition"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};