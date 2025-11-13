import React from 'react';
import {BORROWER_DISPUTE_ACTIONS, LENDER_DISPUTE_ACTIONS} from "../util/Util.js";
import PayDamagesContent from "./modalContent/PayDamagesContent.jsx";
import ViewClaimDetailsContent from "./modalContent/ViewClaimContent.jsx";
import SubmitEvidenceContent from "./modalContent/SubmitEvidenceContent.jsx";
import ViewReportContent from "./modalContent/ViewReportContent.jsx";
import Modal from "../common/Modal.jsx";
import SettleContent from "./modalContent/SettleContent.jsx";
import FileClaimContent from "./modalContent/FileClaimContent.jsx";

/**
 * Manages rendering the correct modal content and connects the UI buttons
 * to the final state-changing handlers (onConfirmAction).
 */
export default function DisputeActionModal({selectedAction, dispute, closeModal, setAppData}) {
    if (!selectedAction || !dispute) return null;

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
            modalTitle = `Submit Defense Evidence: ${dispute.itemTitle}`;
            modalContent = <SubmitEvidenceContent dispute={dispute} onClose={closeModal} setAppData={setAppData} />;
            break;

        case BORROWER_DISPUTE_ACTIONS.PAY_DAMAGES:
            modalTitle = `Payment Required: ${dispute.itemTitle}`;
            modalContent = <PayDamagesContent dispute={dispute} onClose={closeModal} setAppData={setAppData} />;
            modalWidth = 'max-w-sm';
            break;

        case LENDER_DISPUTE_ACTIONS.VIEW_CLAIM_DETAILS:
            modalTitle = `Viewing Claim Details: ${dispute.itemTitle}`;
            modalContent = <ViewClaimDetailsContent dispute={dispute} onClose={closeModal} />;
            return (
                <Modal isOpen={true} onClose={closeModal} title={modalTitle} maxWidth={modalWidth}>
                    {modalContent}
                </Modal>
            );

        case LENDER_DISPUTE_ACTIONS.VIEW_REPORT:
        case BORROWER_DISPUTE_ACTIONS.VIEW_REPORT:
            modalTitle = `Viewing Final Report: ${dispute.itemTitle}`;
            modalContent = <ViewReportContent dispute={dispute} onClose={closeModal} />;
            return (
                <Modal isOpen={true} onClose={closeModal} title={modalTitle} maxWidth={modalWidth}>
                    {modalContent}
                </Modal>
            );

        default:
            return null;
    }

    return (
        <Modal isOpen={true} onClose={closeModal} title={modalTitle} maxWidth={modalWidth}>
            {modalContent}
        </Modal>
    );
}