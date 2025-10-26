import React from 'react';
import {X} from 'lucide-react';

/**
 * A generic, reusable modal component.
 *
 * @param {boolean} isOpen - Controls visibility.
 * @param {function} onClose - Function to call when closing the modal (e.g., clicking backdrop or X button).
 * @param {React.ReactNode} children - The content to display inside the modal body.
 * @param {string} title - The title displayed in the modal header.
 * @param {string} maxWidth - Tailwind class for maximum width (e.g., 'max-w-xl').
 */
export default function Modal({ isOpen, onClose, children, title, maxWidth = 'max-w-lg' }) {
    if (!isOpen) return null;

    const stopPropagation = (e) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-xl shadow-2xl ${maxWidth} w-full transform transition-all duration-300 scale-100 opacity-100`}
                onClick={stopPropagation}
            >

                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}