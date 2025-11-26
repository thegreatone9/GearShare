import './styles/App.css'
import LandingPage from "./components/landing/LandingPage.jsx";
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import MarketplaceContent from "./components/item/MarketPlace.jsx";
import Header from "./components/common/Header.jsx";
import DisputeDashboard from "./components/dispute/DisputeDashboard.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import React, {useEffect, useState} from "react";
import ErrorPage from "./components/common/ErrorPage.jsx";
import ItemForm from "./components/item/ItemForm.jsx";
import {checkSession} from "./components/util/Util.js";
import Footer from "./components/common/Footer.jsx";
import UserProfile from "./components/user/UserProfile.jsx";
import LenderDashboardContainer from "./components/lender/LenderDashboardContainer.jsx";
import BorrowerDashboardContainer from "./components/borrower/BorrowerDashboardContainer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import {useAuth} from "./components/AppContext.jsx";
import ToastContainer from "./components/common/ToastContainer.jsx";

export default function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const {setAuthenticatedUser} = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        checkSession()
            .then(user => {
                if (user) {
                    setAuthenticatedUser(user);

                    const currentPath = location.pathname;
                    if (currentPath === '/' || currentPath === '/auth') {
                        navigate('/borrower', {replace: true});
                    }

                } else {
                    navigate('/');
                }

            })
            .finally(() => {
                setIsLoading(false);
            });

    }, []);

    if (isLoading) {
        return (
            <div className="flex-grow flex items-center justify-center h-screen">
                <p className="text-xl text-indigo-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen font-inter antialiased">
            <ToastContainer />
            <main className="flex-grow px-4">
                <Header/>
                <div
                    className={`mt-[120px] max-w-4xl mx-auto ${location.pathname === '/' ? '' : 'px-4 sm:px-6 lg:px-8'} bg-indigo-50 rounded-2xl shadow-2xl mb-12`}>
                    <Routes>
                        <Route path="/" element={<LandingPage/>}/>
                        <Route path="/auth" element={<AuthPage/>}/>
                        <Route path="/error"
                               element={<ErrorPage message="You must be signed in to view this dashboard."/>}/>

                        <Route path="/marketplace" element={<MarketplaceContent/>}/>

                        <Route
                            path="/borrower"
                            element={<ProtectedRoute>
                                <BorrowerDashboardContainer/>
                            </ProtectedRoute>}
                        />
                        <Route
                            path="/lender"
                            element={<ProtectedRoute>
                                <LenderDashboardContainer/>
                            </ProtectedRoute>}
                        />
                        <Route
                            path="/item/:id?"
                            element={<ProtectedRoute>
                                <ItemForm/>
                            </ProtectedRoute>}
                        />
                        <Route
                            path="/disputes"
                            element={<ProtectedRoute>
                                <DisputeDashboard/>
                            </ProtectedRoute>}
                        />
                        <Route
                            path="/profile"
                            element={<ProtectedRoute>
                                <UserProfile/>
                            </ProtectedRoute>}
                        />

                        <Route path="*" element={<ErrorPage message={'404: Page Not Found'}/>}/>
                    </Routes>
                </div>
            </main>
            <Footer/>
        </div>
    )
}