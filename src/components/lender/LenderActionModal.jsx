import AcceptRentalRequest from "./modalContent/AcceptRentalRequest.jsx";
import Modal from "../common/Modal.jsx";
import React from 'react';
import {Link} from 'react-router-dom';
import {MODAL_CATEGORY} from "./LenderUtil.js";

const ModalComponentMap = {
    [MODAL_CATEGORY.ACCEPT_RENTAL_REQUEST]: AcceptRentalRequest,

    // Single component for general item details view across all lists (Inventory, Active, Disputed, Past)
    [MODAL_CATEGORY.ITEM]: ({ item, onClose }) => (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">{item.title} Overview</h3>

            <div className="mb-4">
                <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-3"/>
                <p className="text-gray-700 mb-2"><strong>Location:</strong> {item.location || 'N/A'}</p>
                <p className="text-gray-700"><strong>Rate:</strong> ${item.price}/{item.unit}</p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                For detailed management or editing, please go to the full item page.
            </p>

            {/* Link to the full ItemForm page */}
            <Link
                to={`/item/${item.id}?role=LENDER`}
                onClick={onClose}
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition pointer-events-auto"
            >
                Manage/Edit Item Details
            </Link>
        </div>
    ),

    // Can add other generic item modals here as needed (e.g., disputeReview, returnFlow)
};

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