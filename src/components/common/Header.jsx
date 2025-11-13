import {Link, useLocation} from "react-router-dom";
import {Briefcase, ChevronDown, Home, LogOut, Scale, User, Zap} from 'lucide-react';
import logo from '../../../public/gear-share.svg';
import React, {useState} from "react";

export default function Header ({ authenticatedUser, logOut }) {
    const location = useLocation();
    const isAuthenticated = !!authenticatedUser;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // NEW: Mobile menu state

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const publicTabs = [
        { path: '/marketplace', label: 'Browse Marketplace', icon: Home },
    ];
    const dashboardTabs = [
        { path: '/borrower', label: 'Borrower', icon: Zap },
        { path: '/lender', label: 'Lender', icon: Briefcase },
        { path: '/disputes', label: 'Disputes', icon: Scale },
    ];

    // Helper function to style active/inactive tabs
    const getTabClass = (path) => {
        const isActive = location.pathname === path;
        return `py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center whitespace-nowrap 
     ${
            isActive
                ? 'bg-indigo-100 text-indigo-700 shadow-inner'
                : 'text-gray-600 hover:bg-gray-100'
        }`;
    };

    // Handler to close all menus on navigation/logout
    const handleLogoutAndClose = () => {
        logOut();
        setIsDropdownOpen(false);
        closeMobileMenu();
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center h-[72px]">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-5 text-2xl font-extrabold text-indigo-700 tracking-tight cursor-pointer">
                    <img src={logo} alt="GearShare Logo" style={{ width: '24px' }}/> GearShare
                </Link>

                {/* A. Desktop Navigation (Visible on SM screens and up) */}
                {/* NOTE: We keep 'sm:flex' but make the profile icon positioning relative */}
                <div className="relative"> {/* NEW: Relative container for dropdown positioning */}
                    <nav className="hidden sm:flex items-center space-x-3">
                        {/* 1. Public Links */}
                        {publicTabs.map((tab) => (
                            <Link key={tab.path} to={tab.path} className={getTabClass(tab.path)}>
                                <tab.icon className="w-5 h-5 mr-1" />
                                {tab.label}
                            </Link>
                        ))}

                        {/* 2. Dashboard Links */}
                        {authenticatedUser && dashboardTabs.map((tab) => (
                            <Link key={tab.path} to={tab.path} className={getTabClass(tab.path)}>
                                <tab.icon className="w-5 h-5 mr-1" />
                                {tab.label}
                            </Link>
                        ))}

                        {/* 3. Profile/Auth Icon and Dropdown */}
                        {authenticatedUser ? (
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition focus:outline-none"
                            >
                                <User className="w-6 h-6 text-indigo-600"/>
                                <ChevronDown className="w-4 h-4 text-gray-500"/>
                            </button>
                        ) : (
                            <Link to="/auth" className={getTabClass('/auth')}>
                                <User className="w-5 h-5 mr-1"/>
                                Sign In
                            </Link>
                        )}

                        {/* Dropdown Menu (Positioning Fixed) */}
                        {isAuthenticated && isDropdownOpen && (
                            <div
                                onMouseLeave={() => setIsDropdownOpen(false)}
                                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 origin-top-right animate-fadeIn"
                            >
                                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 font-semibold">
                                    {authenticatedUser.name}
                                </div>
                                <button
                                    onClick={handleLogoutAndClose}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </nav>
                </div>

                {/* B. Mobile Menu Toggle Button (Visible only on small screens) */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full bg-indigo-200 text-black p-0 border-0 shadow-md"
                    aria-label="Toggle menu"
                >
                    =
                </button>

            </div>

            {/* C. Mobile Menu Drawer (The Collapsed Nav) */}
            {isMobileMenuOpen && (
                <div className="sm:hidden absolute top-[72px] inset-x-0 bg-white shadow-xl border-t border-gray-100 pb-4 z-40 animate-fadeInDown">
                    <nav className="flex flex-col space-y-1 p-4">
                        {/* Map all public links */}
                        {publicTabs.map((tab) => (
                            <Link key={tab.path} to={tab.path} onClick={closeMobileMenu} className={getTabClass(tab.path) + " py-2 px-3 rounded-lg flex items-center"}>
                                <tab.icon className="w-5 h-5 mr-3"/>
                                {tab.label}
                            </Link>
                        ))}

                        {/* Map all dashboard links if authenticated */}
                        {isAuthenticated && (
                            <React.Fragment>
                                <div className="py-2 px-3 text-xs font-semibold text-gray-500 border-t mt-2">DASHBOARD</div>
                                {dashboardTabs.map((tab) => (
                                    <Link key={tab.path} to={tab.path} onClick={closeMobileMenu} className={getTabClass(tab.path) + " py-2 px-3 rounded-lg flex items-center"}>
                                        <tab.icon className="w-5 h-5 mr-3"/>
                                        {tab.label}
                                    </Link>
                                ))}
                            </React.Fragment>
                        )}

                        {/* Mobile Auth/Sign Out Button */}
                        <div className="pt-3 border-t mt-3">
                            {isAuthenticated ? (
                                <button onClick={handleLogoutAndClose} className="w-full text-left flex items-center px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                                    <LogOut className="w-5 h-5 mr-3"/>
                                    Sign Out ({authenticatedUser.name})
                                </button>
                            ) : (
                                <Link to="/auth" onClick={closeMobileMenu} className="w-full text-left flex items-center px-3 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                                    <User className="w-5 h-5 mr-3"/>
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}