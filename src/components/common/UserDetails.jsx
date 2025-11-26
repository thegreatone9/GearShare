import React, {useEffect, useState} from "react";
import {supabase} from "../../server/supabaseClient.js";
import Loader from "./Loader.jsx";

export default function UserDetails({ userId, onClose }) {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        const fetchUser = async function () {
            const { data: userData, error: userError } = await supabase
                .from('accounts')
                .select('name, email')
                .eq('id', userId)
                .single();

            if (userError) {
                console.error("Error fetching user:", userError);
            }

            setUser(userData);
        }

        fetchUser()
            .then(() => setLoading(false));

    }, [userId]);

    if (loading) {
        return <Loader show={loading} message={'Loading User Details'}/>
    }

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">{user.name} Overview</h3>

            <div className="mb-4">
                <img src={user.image_url} alt={user.name} className="w-full h-48 object-cover rounded-lg mb-3"/>
                <p className="text-gray-700 mb-2"><strong>Name:</strong> {user.name}</p>
                <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
            </div>
        </div>
    )
}