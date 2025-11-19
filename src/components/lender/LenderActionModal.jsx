import Modal from "../common/Modal.jsx";
import React from 'react';
import {MODAL_CATEGORY, ModalComponentMap} from "./LenderUtil.js";

export default function LenderActionModal({ category, modalProps, isModalOpen, setIsModalOpen }) {
    const ComponentToRender = ModalComponentMap[category];
    const { title, maxWidth, modalLoading, ...componentSpecificProps } = modalProps;

    if (!ComponentToRender) {
        return null;
    }

    // 3. Define the final props for the inner component
    const finalComponentProps = {
        ...componentSpecificProps,
        onClose: () => setIsModalOpen(false), // Always pass onClose handler
    };

    // Use a smaller max-width for the Accept Request flow for better focus
    const modalMaxWidth = maxWidth || (category === MODAL_CATEGORY.ACCEPT_RENTAL_REQUEST ? "max-w-lg" : "max-w-xl");
    const modalTitle = title || "Action Required";

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={modalTitle}
            maxWidth={modalMaxWidth}
        >
            {modalLoading ? (
                <div className="p-4 text-center text-indigo-600">Loading Details...</div>
            ) : (
                // RENDER THE IFRAME-STYLE CONTAINER for the component content
                <div
                    className={category === 'item' ? "h-[60vh] overflow-y-auto border border-gray-300 rounded-xl bg-gray-50 shadow-inner p-4" : ""}
                    style={{ minHeight: category === 'item' ? '400px' : 'auto' }}
                >
                    <ComponentToRender {...finalComponentProps} />
                </div>
            )}
        </Modal>
    );
}