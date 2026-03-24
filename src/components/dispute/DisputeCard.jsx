import React from "react";
import {CLIENT_DISPUTE_ACTIONS, itemImageSrc, MERCHANT_DISPUTE_ACTIONS, ROLE} from "../util/Util.js";
import {ACTION_ICONS} from "./DisputeUtils.jsx";

export default function DisputeCard({disputeData, openActionModal, openOpponentDetails, openItemDetails}) {
    const isMerchant = disputeData.userRole === ROLE.MERCHANT;

    const MERCHANT_ACTION_CARD = {
        [MERCHANT_DISPUTE_ACTIONS.SETTLE]: {
            icon: ACTION_ICONS[MERCHANT_DISPUTE_ACTIONS.SETTLE],
            label: 'Settle',
            className: 'bg-green-600 hover:bg-green-700'
        },
        [MERCHANT_DISPUTE_ACTIONS.FILE_CLAIM]: {
            icon: ACTION_ICONS[MERCHANT_DISPUTE_ACTIONS.FILE_CLAIM],
            label: 'File Claim',
            className: 'bg-red-600 hover:bg-red-700'
        },
        [MERCHANT_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS]: {
            icon: ACTION_ICONS[MERCHANT_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS],
            label: 'View Claim Details',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [MERCHANT_DISPUTE_ACTIONS.VIEW_REPORT]: {
            icon: ACTION_ICONS[MERCHANT_DISPUTE_ACTIONS.VIEW_REPORT],
            label: 'View Report',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [MERCHANT_DISPUTE_ACTIONS.VIEW_CLIENT]: {
            icon: ACTION_ICONS[MERCHANT_DISPUTE_ACTIONS.VIEW_CLIENT],
            label: 'Client Details',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [MERCHANT_DISPUTE_ACTIONS.VIEW_ITEM]: {
            icon: ACTION_ICONS[MERCHANT_DISPUTE_ACTIONS.VIEW_ITEM],
            label: 'Item Details',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        }
    }

    const CLIENT_ACTION_CARD = {
        [CLIENT_DISPUTE_ACTIONS.SUBMIT_EVIDENCE]: {
            icon: ACTION_ICONS[CLIENT_DISPUTE_ACTIONS.SUBMIT_EVIDENCE],
            label: 'Submit Evidence',
            className: 'bg-yellow-600 hover:bg-red-700'
        },
        [CLIENT_DISPUTE_ACTIONS.VIEW_REPORT]: {
            icon: ACTION_ICONS[CLIENT_DISPUTE_ACTIONS.VIEW_REPORT],
            label: 'View Report',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [CLIENT_DISPUTE_ACTIONS.PAY_DAMAGES]: {
            icon: ACTION_ICONS[CLIENT_DISPUTE_ACTIONS.PAY_DAMAGES],
            label: 'Pay Damages',
            className: 'bg-red-600 hover:bg-red-700'
        },
        [CLIENT_DISPUTE_ACTIONS.VIEW_MERCHANT]: {
            icon: ACTION_ICONS[CLIENT_DISPUTE_ACTIONS.VIEW_MERCHANT],
            label: 'Merchant Details',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [CLIENT_DISPUTE_ACTIONS.VIEW_ITEM]: {
            icon: ACTION_ICONS[CLIENT_DISPUTE_ACTIONS.VIEW_ITEM],
            label: 'Item Details',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        }
    }

    return (
        <div key={disputeData.dispute.id}
             className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
            <div className="flex items-center space-x-3 cursor-pointer"
                 onClick={() => openItemDetails(disputeData)}>
                <img src={itemImageSrc(disputeData.item.image_url, disputeData.item.title)} alt={disputeData.item.title}
                     className="w-12 h-12 rounded-lg object-cover"/>
                <div>
                    <p className="text-md text-gray-900">{disputeData.item.title}</p>
                    <a className="text-sm text-indigo-900 hover:underline" href="#" onClick={(event) => openOpponentDetails(event, disputeData)}>{isMerchant ? 'Client' : 'Merchant'} Details</a>
                    <p className={`my-1 px-2 py-1 text-xs font-medium rounded-full ${disputeData.color} shadow-sm`}>
                        {disputeData.label}
                    </p>
                </div>
            </div>
            {disputeData.actions.length !== 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    {
                        disputeData.actions.map(actionKey => {
                            const actionProps = isMerchant ? MERCHANT_ACTION_CARD[actionKey] : CLIENT_ACTION_CARD[actionKey];

                            if (!actionProps) return null; // Safety check
                            const ActionIcon = actionProps.icon;

                            return (
                                <button
                                    key={actionKey}
                                    onClick={() => openActionModal(actionKey, disputeData)}
                                    className={`text-sm text-white px-4 py-2 rounded-lg transition flex items-center justify-center font-medium shadow-md ${actionProps.className}`}>
                                    <ActionIcon className="w-4 h-4"/>
                                    {actionProps.label}
                                </button>
                            )
                        })
                    }
                </div>
            )}
        </div>
    );
}