import React, {useContext, useEffect, useState} from 'react';
import {AlertTriangle, CheckCircle, Hash, Mail, Phone, Save, User} from 'lucide-react';
import {AuthContext} from "../../App.jsx";
import {supabase} from "../../server/supabaseClient.js";
import {getStatusClasses, getUserSessionData, updateUserCookie} from "../util/Util.js";

export default function UserProfile() {
    const {authenticatedUser, setAuthenticatedUser} = useContext(AuthContext);
    const MIN_PASSWORD_LEN = 1;
    const MIN_PHONE_LEN = 9;
    const MAX_PHONE_LEN = 12;
    const PHONE_REGEX = /^[0-9]{9,12}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [initialUserData, setInitialUserData] = useState();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async function () {
            const { data: user, error: accountError  } = await supabase.from('accounts')
                .select('*')
                .eq('email', authenticatedUser.email)
                .single();

            if (accountError) {
                throw new Error('Unable to load User Profile data');
            }

            return user;
        }

        fetchUserData()
            .then(user => {
                const userData = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    phone: user.phone || ''
                };

                setInitialUserData(userData);
                setFormData(userData);
            });
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setLoading(true);
        setStatusMessage({ type: '', text: '' });

        try {
            if (!EMAIL_REGEX.test(formData.email)) {
                throw new Error(`Email cannot be empty!`);
            }

            if (!PHONE_REGEX.test(formData.phone)) {
                throw new Error(`Phone must be ${MIN_PHONE_LEN} to ${MAX_PHONE_LEN} digits.`);
            }

            if (formData.password.length < MIN_PASSWORD_LEN) {
                throw new Error(`Password must be at least ${MIN_PASSWORD_LEN} characters long.`);
            }

            const { error: accountError } = await supabase
                .from('accounts')
                .update(formData)
                .eq('id', initialUserData.id);

            if (accountError) {
                throw new Error(`Failed to update profile details: ${accountError.message}`);
            }

            setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });

            setInitialUserData(formData);

            const userSessionData = getUserSessionData(formData);

            setAuthenticatedUser(userSessionData);
            updateUserCookie(userSessionData);

        } catch (error) {
            console.error("Save Error:", error);
            setStatusMessage({ type: 'error', text: `Failed to update: ${error.message}` });

        } finally {
            setLoading(false);
        }
    };

    if (!authenticatedUser) {
        return (
            <div className="py-12 max-w-xl mx-auto text-center">
                <p className="text-gray-600">Please sign in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSave} className="max-w-xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-2xl border-t-4 border-indigo-600 space-y-6">

                <div className="text-center border-b pb-4">
                    <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                        <User className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h1 className="font-extrabold text-gray-900">Profile</h1>
                </div>

                {statusMessage.text && (
                    <div className={`p-4 rounded-lg border-l-4 font-medium ${getStatusClasses(statusMessage.type)} flex items-center`}>
                        {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
                        {statusMessage.text}
                    </div>
                )}

                {/* Editable Details */}
                <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <User className="w-4 h-4 mr-2 text-indigo-600" /> Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-indigo-600" /> Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition autofill-fix"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Hash className="w-4 h-4 mr-2 text-indigo-600" /> New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder={`Min ${MIN_PASSWORD_LEN} characters required for change`}
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition autofill-fix"
                        />
                    </div>

                    {/* Phone Number Input */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-indigo-600" /> Phone Number
                        </label>
                        <input
                            id="phone"
                            type="phone"
                            placeholder={`${MIN_PHONE_LEN} to ${MAX_PHONE_LEN} Digits`}
                            value={formData.phone || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition autofill-fix"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 flex items-center justify-center font-bold rounded-lg shadow-md transition ${
                            loading
                                ? 'bg-indigo-400 text-white cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                        {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        <Save className="w-5 h-5 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}