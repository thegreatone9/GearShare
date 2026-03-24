import Modal from "./Modal.jsx";
import React from 'react';
import {MODAL_CATEGORY} from "../util/Util.js";
import AcceptRentalRequest from "../merchant/modalContent/AcceptRentalRequest.jsx";
import ModalItemDetails from "./ModalItemDetails.jsx";
import UserDetails from "./UserDetails.jsx";

const ModalComponentMap = {
    [MODAL_CATEGORY.ACCEPT_RENTAL_REQUEST]: AcceptRentalRequest,
    [MODAL_CATEGORY.ITEM]: ModalItemDetails,
    [MODAL_CATEGORY.CLIENT]: UserDetails,
    [MODAL_CATEGORY.MERCHANT]: UserDetails

    // Can add other generic item modals here as needed (e.g., disputeReview, returnFlow)
};

export default function ActionModal({ category, modalProps, isModalOpen, setIsModalOpen }) {
    const ComponentToRender = ModalComponentMap[category];
    const { title, maxWidth, ...componentSpecificProps } = modalProps;

    if (!ComponentToRender) {
        return null;
    }

    //Define the final props for the inner component
    const finalComponentProps = {
        ...componentSpecificProps,
        onClose: () => setIsModalOpen(false), // Always pass onClose handler
    };

    //Use a smaller max-width for the Accept Request flow for better focus
    const modalMaxWidth = maxWidth || (category === MODAL_CATEGORY.ACCEPT_RENTAL_REQUEST ? "max-w-lg" : "max-w-xl");
    const modalTitle = title || "Action Required";

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={modalTitle}
            maxWidth={modalMaxWidth}
        >
            <div
                className={category === 'item' ? "h-[60vh] overflow-y-auto border border-gray-300 rounded-xl bg-gray-50 shadow-inner p-4" : ""}
                style={{ minHeight: category === 'item' ? '400px' : 'auto' }}
            >
                <ComponentToRender {...finalComponentProps} />
            </div>
        </Modal>
    );
}