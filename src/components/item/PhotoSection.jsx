import React, { useState } from 'react';
import { Image, X } from 'lucide-react';

export const PhotoSection = ({ editMode, itemState, handleChange }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const dummyImage = "https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Photo";

    const imageKeys = ['url_1', 'url_2', 'url_3'];
    const imageObject = itemState.image_url || {};

    const handleUrlChange = (key, value) => {
        const updatedImages = {
            ...imageObject,
            [key]: value
        };

        handleChange({
            target: {
                id: 'image_url',
                value: updatedImages
            }
        });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-xl font-semibold text-indigo-700">3. Photos</h4>

            <div className="grid grid-cols-3 gap-4">
                {imageKeys.map((key, index) => {
                    const url = imageObject[key] || '';
                    const displayUrl = url && url.length > 0 ? url : dummyImage;

                    return (
                        <div key={key} className="flex flex-col space-y-2">
                            {/* Image Preview */}
                            <div
                                className="relative w-full h-24 sm:h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer group bg-gray-50"
                                onClick={() => url && setSelectedImage(displayUrl)}
                            >
                                <img
                                    src={displayUrl}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => e.target.src = dummyImage}
                                />
                            </div>

                            {/* URL Input */}
                            {editMode && (
                                <div>
                                    <label htmlFor={key} className="flex items-center text-xs font-medium text-gray-700 mb-1">
                                        <Image className="w-3 h-3 mr-1 text-indigo-600" /> Photo {index + 1}
                                    </label>
                                    <input
                                        id={key}
                                        type="text"
                                        placeholder="Paste URL..."
                                        value={url}
                                        onChange={(e) => handleUrlChange(key, e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Lightbox Modal (Same as before) */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl w-full">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Enlarged view"
                            className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};