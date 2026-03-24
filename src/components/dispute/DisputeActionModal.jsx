import React from 'react';
import {CLIENT_DISPUTE_ACTIONS, MERCHANT_DISPUTE_ACTIONS} from "../util/Util.js";
import PayDamagesContent from "./modalContent/PayDamagesContent.jsx";
import ViewClaimDetailsContent from "./modalContent/ViewClaimContent.jsx";
import SubmitEvidenceContent from "./modalContent/SubmitEvidenceContent.jsx";
import ViewReportContent from "./modalContent/ViewReportContent.jsx";
import Modal from "../common/Modal.jsx";
import SettleContent from "./modalContent/SettleContent.jsx";
import FileClaimContent from "./modalContent/FileClaimContent.jsx";
import ModalItemDetails from "../common/ModalItemDetails.jsx";
import UserDetails from "../common/UserDetails.jsx";

/**
 * Manages rendering the correct modal content and connects the UI buttons
 * to the final state-changing handlers (onConfirmAction).
 */
export default function DisputeActionModal({modalState, closeModal, setAppData}) {
    const selectedAction= modalState.action;
    if (!selectedAction) {
        return null;
    }

    const disputeData = modalState.disputeData;
    let modalTitle = "";
    let modalContent = null;
    let modalWidth = 'max-w-xl';

    switch (selectedAction) {
        case MERCHANT_DISPUTE_ACTIONS.SETTLE:
            modalTitle = "Confirm Deposit Release";
            modalContent = <SettleContent disputeData={disputeData} onClose={closeModal} setAppData={setAppData} />;
            modalWidth = 'max-w-md';
            break;

        case MERCHANT_DISPUTE_ACTIONS.FILE_CLAIM:
            modalTitle = "File Claim & Retain Deposit";
            modalContent = <FileClaimContent disputeData={disputeData} onClose={closeModal} setAppData={setAppData} />;
            break;

        case CLIENT_DISPUTE_ACTIONS.SUBMIT_EVIDENCE:
            modalTitle = `Submit Defense Evidence: ${disputeData.item.title}`;
            modalContent = <SubmitEvidenceContent disputeData={disputeData} onClose={closeModal} setAppData={setAppData} />;
            break;

        case CLIENT_DISPUTE_ACTIONS.PAY_DAMAGES:
            modalTitle = `Payment Required: ${disputeData.item.title}`;
            modalContent = <PayDamagesContent disputeData={disputeData} onClose={closeModal} setAppData={setAppData} />;
            modalWidth = 'max-w-sm';
            break;

        case MERCHANT_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS:
            modalTitle = `Viewing Claim Details: ${disputeData.item.title}`;
            modalContent = <ViewClaimDetailsContent disputeData={disputeData} onClose={closeModal} />;
            break;

        case MERCHANT_DISPUTE_ACTIONS.VIEW_REPORT:
        case CLIENT_DISPUTE_ACTIONS.VIEW_REPORT:
            modalTitle = `Viewing Final Report: ${disputeData.item.title}`;
            modalContent = <ViewReportContent disputeData={disputeData} onClose={closeModal} />;
            break;

        case MERCHANT_DISPUTE_ACTIONS.VIEW_CLIENT:
            modalTitle = 'Client Details';
        case CLIENT_DISPUTE_ACTIONS.VIEW_MERCHANT:
            modalTitle = modalTitle ? modalTitle : 'Merchant Details';
            modalContent = <UserDetails userId={disputeData.opponentId} onClose={closeModal} />;
            break;

        case MERCHANT_DISPUTE_ACTIONS.VIEW_ITEM:
        case CLIENT_DISPUTE_ACTIONS.VIEW_ITEM:
            modalTitle = `${disputeData.item.title} Details`;
            modalContent = <ModalItemDetails item={disputeData.item} onClose={closeModal} />;
            break;

        default:
            return null;
    }

    return (
        <Modal isOpen={true} onClose={closeModal} title={modalTitle} maxWidth={modalWidth}>
            {modalContent}
        </Modal>
    );
}