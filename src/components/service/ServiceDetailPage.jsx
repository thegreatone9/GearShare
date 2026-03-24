import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {apiRequest, itemImageSrc, TOAST_TYPE} from '../util/Util.js';
import {useToast} from '../AppContext.jsx';
import Loader from '../common/Loader.jsx';
import {MapPin, Phone, Mail, User, ArrowLeft, Tag, Layers} from 'lucide-react';

export default function ServiceDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {addToast} = useToast();
    const [loading, setLoading] = useState(true);
    const [service, setService] = useState(null);
    const [provider, setProvider] = useState(null);

    useEffect(() => {
        const fetchService = async () => {
            setLoading(true);

            // Fetch service listing
            const {data: serviceData, error: serviceError} = await apiRequest(`/api/db/listings`, {
                params: {['eq.id']: id, single: true}
            });

            if (serviceError || !serviceData) {
                addToast(TOAST_TYPE.ERROR, 'Service not found.');
                setLoading(false);
                return;
            }

            setService(serviceData);

            // Fetch provider account
            const {data: providerData} = await apiRequest(`/api/db/accounts`, {
                params: {['eq.id']: serviceData.owner_id, single: true}
            });

            if (providerData) {
                setProvider(providerData);
            }

            setLoading(false);
        };

        fetchService();
    }, [id]);

    if (loading) {
        return <Loader show={loading} message="Loading Service Details"/>;
    }

    if (!service) {
        return <div className="py-8 text-center text-red-600">Service not found. Invalid service ID.</div>;
    }

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4"/> Back
            </button>

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Hero Image */}
                <div className="service-detail__hero">
                    <img
                        src={itemImageSrc(service.image_url, service.title)}
                        alt={service.title}
                        className="w-full h-64 sm:h-80 object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/800x400/EA580C/FFFFFF?text=Service";
                        }}
                    />
                    <span className="service-detail__badge">SERVICE</span>
                </div>

                <div className="p-6 md:p-10 space-y-6">
                    {/* Title & Category */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                        <div className="flex flex-wrap gap-3">
                            {service.category && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                    <Tag className="w-3.5 h-3.5"/> {service.category}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                <Layers className="w-3.5 h-3.5"/> Service Listing
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">About This Service</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {service.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Location */}
                    {service.location && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0"/>
                            <div>
                                <p className="font-medium text-gray-800">Service Area</p>
                                <p className="text-gray-600">{service.location}</p>
                            </div>
                        </div>
                    )}

                    {/* Provider Contact Section */}
                    {provider && (
                        <div className="border-t pt-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Provider</h2>
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    {provider.image_url ? (
                                        <img src={provider.image_url} alt={provider.name}
                                             className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"/>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
                                            <User className="w-6 h-6 text-orange-600"/>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">{provider.name}</p>
                                        <p className="text-sm text-gray-500">GearShare Provider</p>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                    {provider.email && (
                                        <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                                            <Mail className="w-4 h-4 text-orange-500"/>
                                            <a href={`mailto:${provider.email}`}
                                               className="text-sm text-indigo-600 hover:underline">
                                                {provider.email}
                                            </a>
                                        </div>
                                    )}
                                    {provider.phone && (
                                        <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                                            <Phone className="w-4 h-4 text-orange-500"/>
                                            <a href={`tel:${provider.phone}`}
                                               className="text-sm text-gray-700 hover:underline">
                                                {provider.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {!provider.email && !provider.phone && (
                                    <p className="text-sm text-gray-500 italic">No contact details available.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Future escrow placeholder */}
                    <div className="border-t pt-6">
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <p className="text-sm text-indigo-600 font-medium">
                                💡 Escrow-protected service bookings coming soon — contact the provider directly for now.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
