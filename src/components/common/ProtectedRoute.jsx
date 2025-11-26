import React, {useContext} from "react";
import {AuthContext, useAuth} from "../AppContext.jsx";
import {Navigate} from "react-router-dom";

export default function ProtectedRoute ({children}) {
    const {isLoading, authenticatedUser} = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-indigo-600">Verifying access...</div>;
    }

    if (!authenticatedUser) {
        return <Navigate to="/auth" replace/>;
    }

    return children;
};