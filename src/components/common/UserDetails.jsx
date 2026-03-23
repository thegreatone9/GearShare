import React, {useEffect, useState} from "react";
import {fetchUserById} from "../../services/service.js";
import Loader from "./Loader.jsx";
import {CheckCircle, XCircle} from 'lucide-react';
import {userImageSrc} from "../util/Util.js";

export default function UserDetails({userId, onClose}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        const fetchUser = async function () {
            const {data: userData, error: userError} = await fetchUserById(userId, 'name, email, phone, image_url, nid_url');

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
                <img src={userImageSrc(user.name)} alt={user.name} className="w-fit h-30 m-auto object-cover rounded-lg mb-3"/>
                <p className="text-gray-700 mb-2"><strong>Name:</strong> {user.name}</p>
                <p className="text-gray-700 mb-2"><strong>Email:</strong> {user.email}</p>
                <p className="text-gray-700 mb-2"><strong>Phone:</strong> {user.phone}</p>
                {user.nid_url ? (
                    <>
                        <p className="text-gray-700">
                            <strong>NID:</strong> User NID verified by GearShare
                            <span className="text-green-500"><CheckCircle className="inline w-4 h-4 ml-1"/></span>
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-gray-700">
                            <strong>NID:</strong> User has not provided NID verification
                            <span className="text-red-500"><XCircle className="inline w-4 h-4 ml-1"/></span>
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}