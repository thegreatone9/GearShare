import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiRequest, LISTING_CATEGORY, LISTING_STATUS, TOAST_TYPE} from '../util/Util.js';
import {useAuth, useToast} from '../AppContext.jsx';
import {ArrowLeft, CheckCircle, AlertTriangle} from 'lucide-react';

export default function ServiceForm() {
    const navigate = useNavigate();
    const {authenticatedUser} = useAuth();
    const {addToast} = useToast();
    const [statusMessage, setStatusMessage] = useState({text: '', type: ''});

    const [formState, setFormState] = useState({
        title: '',
        description: '',
        category: LISTING_CATEGORY.OTHERS,
        location: '',
        image_url: ''
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormState(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formState.title.trim()) {
            setStatusMessage({text: 'Service name is required.', type: 'error'});
            return;
        }
        if (!formState.description.trim()) {
            setStatusMessage({text: 'Description is required.', type: 'error'});
            return;
        }
        if (!formState.location.trim()) {
            setStatusMessage({text: 'Service area/location is required.', type: 'error'});
            return;
        }

        const payload = {
            owner_id: authenticatedUser.id,
            title: formState.title.trim(),
            description: formState.description.trim(),
            category: formState.category,
            location: formState.location.trim(),
            image_url: formState.image_url.trim() || null,
            listing_type: 'SERVICE',
            status: LISTING_STATUS.ACTIVE,
            price: null,
            daily_rate: null,
            replacement_value: null,
            condition: null,
            unit: null,
            time_unit: null,
            rating: null
        };

        const {error} = await apiRequest('/api/db/listings', {
            method: 'POST',
            body: payload
        });

        if (error) {
            setStatusMessage({text: `Failed to create service: ${error}`, type: 'error'});
            addToast(TOAST_TYPE.ERROR, 'Failed to create service listing.');
            return;
        }

        setStatusMessage({text: 'Service listed successfully!', type: 'success'});
        addToast(TOAST_TYPE.SUCCESS, 'Service listed on the marketplace!');

        setTimeout(() => navigate('/merchant'), 1500);
    };

    // Categories without 'Any'
    const categories = Object.values(LISTING_CATEGORY).filter(c => c !== LISTING_CATEGORY.ANY);

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4"/> Back
            </button>

            <h3 className="text-3xl font-bold text-gray-800 mb-6">List a Service</h3>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-6">
                {/* Status Message */}
                {statusMessage.text && (
                    <div className={`p-4 rounded-lg border-l-4 font-medium flex items-center ${
                        statusMessage.type === 'success'
                            ? 'bg-green-50 border-green-500 text-green-800'
                            : 'bg-red-50 border-red-500 text-red-800'
                    }`}>
                        {statusMessage.type === 'success'
                            ? <CheckCircle className="w-5 h-5 mr-3"/>
                            : <AlertTriangle className="w-5 h-5 mr-3"/>}
                        {statusMessage.text}
                    </div>
                )}

                {/* Service Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name *</label>
                    <input
                        type="text"
                        name="title"
                        value={formState.title}
                        onChange={handleChange}
                        placeholder="e.g., Professional Tailoring & Alterations"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                    <textarea
                        name="description"
                        value={formState.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describe your service, what you offer, turnaround times, pricing ranges, etc."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Category & Location row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                        <select
                            name="category"
                            value={formState.category}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Service Area / Location *</label>
                        <input
                            type="text"
                            name="location"
                            value={formState.location}
                            onChange={handleChange}
                            placeholder="e.g., Downtown LA"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL (optional)</label>
                    <input
                        type="text"
                        name="image_url"
                        value={formState.image_url}
                        onChange={handleChange}
                        placeholder="https://example.com/your-service-image.jpg"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formState.image_url && (
                        <img
                            src={formState.image_url}
                            alt="Preview"
                            className="mt-3 w-48 h-32 object-cover rounded-lg border"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/300x200/EA580C/FFFFFF?text=Service";
                            }}
                        />
                    )}
                </div>

                {/* Submit */}
                <div className="flex gap-4 justify-center pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
                    >
                        List Service
                    </button>
                </div>
            </form>
        </div>
    );
}
