import React, {useContext, useState} from "react";
import {TOAST_TYPE} from "./util/Util.js";

export const AuthContext = React.createContext();
export const ToastContext = React.createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider!");
    }

    return context;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider!");
    }

    return context;
};

export default function AppContext ({ children }) {
    const [authenticatedUser, setAuthenticatedUser] = useState(null);
    const [toast, setToast] = useState(null);

    const addToast = (type, message, duration = 10000) => {
        const id = Date.now();
        const newToast = { id, type, message };

        if (type === TOAST_TYPE.ERROR) {
            console.error(message);

        } else {
            console.log(message);
        }

        setToast(newToast);

        setTimeout(() => removeToast(id), duration);
    };

    const removeToast = () => {
        setToast(null);
    };

    return (
        <AuthContext.Provider value={{authenticatedUser, setAuthenticatedUser}}>
            <ToastContext.Provider value={{toast, addToast, removeToast}}>
                {children}
            </ToastContext.Provider>
        </AuthContext.Provider>
    )
}