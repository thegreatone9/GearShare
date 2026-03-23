import React, {useEffect, useState} from 'react';
import {useAuth} from "../AppContext.jsx";
import Loader from "../common/Loader.jsx";
import {fetchActivityLog} from "../../services/service.js";
import {ACTIVITY} from "../util/Util.js";

export default function ActivityLog() {
    const {authenticatedUser} = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authenticatedUser) {
            return;
        }

        // Fetch from your simple endpoint
        async function fetchActivity() {
            try {
                const {data} = await fetchActivityLog(authenticatedUser.id);

                setActivities(data);

            } catch (err) {
                console.error(err);

            } finally {
                setLoading(false);
            }
        }

        fetchActivity();
    }, []);

    // 1. Helper to determine Icon and Color based on 'type' string
    const getVisuals = (type) => {
        switch (type) {
            // 💰 Financial & Success Actions (Emerald/Green)
            case ACTIVITY.CONFIRM_RENTAL:
            case ACTIVITY.SETTLE_DISPUTE:
            case ACTIVITY.PAY_DAMAGES:
                return {
                    color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    )
                };

            // ⚠️ Critical Alerts & Disputes (Orange/Warning)
            case ACTIVITY.RETURN_ITEM_CREATE_DISPUTE:
            case ACTIVITY.DECLINE_REQUEST:
            case ACTIVITY.DELETE_LISTING:
                return {
                    color: 'bg-orange-100 text-orange-600 border-orange-200',
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    )
                };

            // 📅 Operational Requests (Blue/Info)
            case ACTIVITY.REQUEST_ITEM:
            case ACTIVITY.UPSERT_ITEM:
                return {
                    color: 'bg-blue-100 text-blue-600 border-blue-200',
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    )
                };

            // ℹ️ Default/Fallback (Gray)
            default:
                return {
                    color: 'bg-gray-100 text-gray-600 border-gray-200',
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    )
                };
        }
    };

    if (loading) {
        return <Loader show={loading} message={'Loading Activity Log...'}/>
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h3 className="text-3xl font-bold text-gray-800">Activity Log</h3>

            {activities.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No recent activity.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((log) => {
                        const style = getVisuals(log.type);

                        return (
                            <div
                                key={log.id}
                                className={`flex items-start p-4 border rounded-xl hover:bg-gray-50 transition w-full gap-4 
                                bg-blue-50/50 border-blue-200`}
                            >
                                {/* 2. Generic Icon Area (Replaces Item Image) */}
                                <div
                                    className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border ${style.color}`}>
                                    {style.icon}
                                </div>

                                {/* 3. Message Content */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <p className="text-gray-900 font-medium leading-snug">
                                        {log.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(log.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}