import React from 'react';
import {BORROWER_DISPUTE_ACTIONS, LENDER_DISPUTE_ACTIONS} from "../util/Util.js";
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

    const dispute= modalState.dispute;
    const opponentId = modalState.opponentId;
    const item = modalState.item;

    let modalTitle = "";
    let modalContent = null;
    let modalWidth = 'max-w-xl';

    switch (selectedAction) {
        case LENDER_DISPUTE_ACTIONS.SETTLE:
            modalTitle = "Confirm Deposit Release";
            modalContent = <SettleContent dispute={dispute} onClose={closeModal} setAppData={setAppData} />;
            modalWidth = 'max-w-md';
            break;

        case LENDER_DISPUTE_ACTIONS.FILE_CLAIM:
            modalTitle = "File Claim & Retain Deposit";
            modalContent = <FileClaimContent dispute={dispute} onClose={closeModal} setAppData={setAppData} />;
            break;

        case BORROWER_DISPUTE_ACTIONS.SUBMIT_EVIDENCE:
            modalTitle = `Submit Defense Evidence: ${dispute.item.title}`;
            modalContent = <SubmitEvidenceContent dispute={dispute} onClose={closeModal} setAppData={setAppData} />;
            break;

        case BORROWER_DISPUTE_ACTIONS.PAY_DAMAGES:
            modalTitle = `Payment Required: ${dispute.item.title}`;
            modalContent = <PayDamagesContent dispute={dispute} onClose={closeModal} setAppData={setAppData} />;
            modalWidth = 'max-w-sm';
            break;

        case LENDER_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS:
            modalTitle = `Viewing Claim Details: ${dispute.item.title}`;
            modalContent = <ViewClaimDetailsContent dispute={dispute} onClose={closeModal} />;
            break;

        case LENDER_DISPUTE_ACTIONS.VIEW_REPORT:
        case BORROWER_DISPUTE_ACTIONS.VIEW_REPORT:
            modalTitle = `Viewing Final Report: ${dispute.item.title}`;
            modalContent = <ViewReportContent dispute={dispute} onClose={closeModal} />;
            break;

        case LENDER_DISPUTE_ACTIONS.VIEW_BORROWER:
            modalTitle = 'Lender Details';
        case BORROWER_DISPUTE_ACTIONS.VIEW_LENDER:
            modalTitle = modalTitle ? modalTitle : 'Borrower Details';
            modalContent = <UserDetails userId={opponentId} onClose={closeModal} />;
            break;

        case LENDER_DISPUTE_ACTIONS.VIEW_ITEM:
        case BORROWER_DISPUTE_ACTIONS.VIEW_ITEM:
            modalTitle = `${item.title} Details`;
            modalContent = <ModalItemDetails item={item} onClose={closeModal} />;
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