import './App.css'
import LandingPage from "./components/landing/LandingPage.jsx";
import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
import MarketplaceContent from "./components/item/MarketPlace.jsx";
import Header from "./components/common/Header.jsx";
import BorrowerDashboard from "./components/borrower/BorrowerDashboard.jsx";
import LenderDashboard from "./components/lender/LenderDashboard.jsx";
import DisputeDashboard from "./components/dispute/DisputeDashboard.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import React, {useContext, useEffect, useState} from "react";
import ErrorPage from "./components/common/ErrorPage.jsx";
import Footer from "./components/common/Footer.jsx";
import ItemForm from "./components/item/ItemForm.jsx";
import {checkSession, MOCK_DATA} from "./components/util/Util.js";
import Cookies from "js-cookie";
import {supabase} from "./server/supabaseClient.js";

export const AuthContext = React.createContext();

export default function App() {
    const navigate = useNavigate();
    const [appData, setAppData] = useState(MOCK_DATA);
    const [authenticatedUser, setAuthenticatedUser] = useState(null);

    const logOut = async () => {
        const {error} = await supabase.auth.signOut();

        if (error) {
            console.error('Error signing out:', error.message);

        } else {
            setAuthenticatedUser(null);
            Cookies.remove('user_data');
            navigate('/');
        }
    };

    useEffect(() => {
        checkSession()
            .then(user => setAuthenticatedUser(user))
            .then(() => navigate('/borrower'))
            .catch(error => {
                console.log(error);

                navigate('/');
            })

    }, []);

    return (
        <AuthContext.Provider value={{authenticatedUser, setAuthenticatedUser}}>
            <div className="font-inter antialiased">
                <Header logOut={logOut}/>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-indigo-50 rounded-2xl shadow-2xl">
                    <div className="mt-[72px]"> {/* Ensures content sits below the fixed header */}
                        <Routes>
                            <Route path="/" element={<LandingPage/>}/>
                            <Route path="/auth" element={<AuthPage />}/>
                            <Route path="/error"
                                   element={<ErrorPage message="You must be signed in to view this dashboard."/>}/>

                            <Route path="/marketplace" element={<MarketplaceContent />}/>

                            <Route
                                path="/borrower"
                                element={<ProtectedRoute>
                                    <BorrowerDashboard/>
                                </ProtectedRoute>}
                            />
                            <Route
                                path="/lender"
                                element={<ProtectedRoute>
                                    <LenderDashboard/>
                                </ProtectedRoute>}
                            />
                            <Route
                                path="/item/:id?"
                                element={<ProtectedRoute>
                                    <ItemForm />
                                </ProtectedRoute>}
                            />
                            <Route
                                path="/disputes"
                                element={<ProtectedRoute>
                                    <DisputeDashboard/>
                                </ProtectedRoute>}
                            />

                            <Route path="*" element={<ErrorPage message={'404: Page Not Found'}/>}/>
                        </Routes>
                    </div>
                </main>
                <Footer/>
            </div>
        </AuthContext.Provider>
    )
}

const ProtectedRoute = ({children}) => {
    const {authenticatedUser} = useContext(AuthContext);

    if (!authenticatedUser) {
        return <Navigate to="/auth" replace/>;
    }

    return children;
};