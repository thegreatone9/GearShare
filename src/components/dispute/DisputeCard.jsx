import React from "react";
import {BORROWER_DISPUTE_ACTIONS, LENDER_DISPUTE_ACTIONS, ROLE} from "../util/Util.js";
import {ACTION_ICONS} from "./DisputeUtils.jsx";

export default function DisputeCard({dispute, openActionModal}) {
    const isLender = dispute.userRole === ROLE.LENDER;

    const LENDER_ACTION_CARD = {
        [LENDER_DISPUTE_ACTIONS.SETTLE]: {
            icon: ACTION_ICONS[LENDER_DISPUTE_ACTIONS.SETTLE],
            label: 'Settle',
            className: 'bg-green-600 hover:bg-green-700'
        },
        [LENDER_DISPUTE_ACTIONS.FILE_CLAIM]: {
            icon: ACTION_ICONS[LENDER_DISPUTE_ACTIONS.FILE_CLAIM],
            label: 'File Claim',
            className: 'bg-red-600 hover:bg-red-700'
        },
        [LENDER_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS]: {
            icon: ACTION_ICONS[LENDER_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS],
            label: 'View Claim Details',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [LENDER_DISPUTE_ACTIONS.VIEW_REPORT]: {
            icon: ACTION_ICONS[LENDER_DISPUTE_ACTIONS.VIEW_REPORT],
            label: 'View Report',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        }
    }

    const BORROWER_ACTION_CARD = {
        [BORROWER_DISPUTE_ACTIONS.SUBMIT_EVIDENCE]: {
            icon: ACTION_ICONS[BORROWER_DISPUTE_ACTIONS.SUBMIT_EVIDENCE],
            label: 'Submit Evidence',
            className: 'bg-yellow-600 hover:bg-red-700'
        },
        [BORROWER_DISPUTE_ACTIONS.VIEW_REPORT]: {
            icon: ACTION_ICONS[BORROWER_DISPUTE_ACTIONS.VIEW_REPORT],
            label: 'View Report',
            className: 'bg-indigo-600 hover:bg-indigo-700'
        },
        [BORROWER_DISPUTE_ACTIONS.PAY_DAMAGES]: {
            icon: ACTION_ICONS[BORROWER_DISPUTE_ACTIONS.PAY_DAMAGES],
            label: 'Pay Damages',
            className: 'bg-red-600 hover:bg-red-700'
        }
    }

    return (
        <div key={dispute.id}
             className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
            <div className="flex items-center space-x-3 cursor-pointer"
                 onClick={() => openItemDetailsModal(dispute.itemid)}>
                <img src={dispute.image} alt={dispute.itemTitle}
                     className="w-12 h-12 rounded-lg object-cover"/>
                <div>
                    <p className="text-md text-gray-900">{dispute.itemTitle}</p>
                    <p className={`inline-block my-1 px-2 py-1 text-xs font-medium rounded-full ${dispute.color} shadow-sm`}>
                        {dispute.label}
                    </p>
                </div>
            </div>
            {dispute.showAction && (
                <div className="flex space-x-2">
                    {
                        dispute.actions.map(actionKey => {
                            const actionProps = isLender ? LENDER_ACTION_CARD[actionKey] : BORROWER_ACTION_CARD[actionKey];

                            if (!actionProps) return null; // Safety check
                            const ActionIcon = actionProps.icon;

                            return (
                                <button
                                    key={actionKey}
                                    onClick={() => openActionModal(actionKey, dispute)}
                                    className={`text-sm text-white px-4 py-2 rounded-lg transition flex items-center font-medium shadow-md ${actionProps.className}`}>
                                    <ActionIcon className="w-4 h-4 mr-2"/>
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