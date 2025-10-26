import {Link, useLocation} from "react-router-dom";
import {Briefcase, ChevronDown, Home, LogOut, Scale, User, Zap} from 'lucide-react';
import {useState} from "react";

export default function Header ({ authenticatedUser, logOut }) {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const isAuthenticated = !!authenticatedUser;

    // Navigation Links - always visible links first
    const publicTabs = [
        { path: '/marketplace', label: 'Browse Marketplace', icon: Home },
    ];

    // Navigation Links - only visible when authenticated
    const dashboardTabs = [
        { path: '/borrower', label: 'Borrower', icon: Zap },
        { path: '/lender', label: 'Lender', icon: Briefcase },
        { path: '/disputes', label: 'Disputes', icon: Scale },
    ];

    // Helper function to style active/inactive tabs based on the current URL path
    const getTabClass = (path) => {
        const isActive = location.pathname === path;
        return `py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center whitespace-nowrap 
     ${
            isActive
                ? 'bg-indigo-100 text-indigo-700 shadow-inner'
                : 'text-gray-600 hover:bg-gray-100'
        }`;
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center h-[72px]">
                {/* Logo - Links to Landing Page */}
                <Link to="/" className="text-2xl font-extrabold text-indigo-700 tracking-tight cursor-pointer">
                    GearShare
                </Link>

                {/* Navigation - Hidden on very small screens, visible on sm: and up */}
                <nav className="hidden sm:flex items-center space-x-3">

                    {/* Public Navigation Links */}
                    {publicTabs.map((tab) => (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={getTabClass(tab.path)}
                        >
                            <tab.icon className="w-5 h-5 mr-1" />
                            {tab.label}
                        </Link>
                    ))}

                    {/* Conditional Dashboard Links */}
                    {authenticatedUser && dashboardTabs.map((tab) => (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={getTabClass(tab.path)}
                        >
                            <tab.icon className="w-5 h-5 mr-1" />
                            {tab.label}
                        </Link>
                    ))}

                    {/* Conditional Profile/Auth Icon */}
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

                    {isAuthenticated && isDropdownOpen && (
                        <div
                            onMouseLeave={() => setIsDropdownOpen(false)}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 origin-top-right animate-fadeIn"
                        >
                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 font-semibold">
                                {authenticatedUser.name}
                            </div>
                            <button
                                onClick={logOut}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                SignOut
                            </button>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Placeholder (Hides Nav on sm: and up) */}
                <button className="sm:hidden w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </div>
        </header>
    );
}