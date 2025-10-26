import {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function AuthPage({ accounts, setAppData, setAuthenticatedUser }) {
    const navigate = useNavigate();
    const [isSigningUp, setIsSigningUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    // Placeholder function for handling successful login/logout
    const handleAuth = (user) => {
        setAuthenticatedUser(user);
    };

    const addAccount = (newUser) => {
        setAppData(prevData => ({
            ...prevData,
            accounts: [...prevData.accounts, newUser]
        }));
    };

    const authenticateUser = (email, password) => {
        return accounts.find(
            account => account.email === email && account.password === password
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (isSigningUp) {
            // 1. SIGN UP LOGIC
            if (authenticateUser(email, password)) {
                setError('An account with this email already exists.');
                return;
            }

            const newUserId = Date.now();
            const newUser = { newUserId, email, password, name };
            addAccount(newUser);

            console.log(`Sign Up successful for ${email}. New account added.`);
            handleAuth(newUser);
            navigate('/borrower');

        } else {
            // 2. SIGN IN LOGIC
            const user = authenticateUser(email, password);

            if (user) {
                console.log(`Sign In successful for ${email}.`);
                handleAuth(user);
                navigate('/borrower');
            } else {
                setError('Invalid email or password.'); // Show error on mismatch
            }
        }
    };

    return (
        <div className="min-h-screen pt-[72px] flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => {setIsSigningUp(true); setError('');}}
                        className={`flex-1 py-4 text-center font-bold transition-all duration-300 ${isSigningUp ? 'text-indigo-600 bg-indigo-50 border-b-4 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={() => {setIsSigningUp(false); setError('');}}
                        className={`flex-1 py-4 text-center font-bold transition-all duration-300 ${!isSigningUp ? 'text-indigo-600 bg-indigo-50 border-b-4 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Sign In
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <h2 className="text-2xl font-extrabold text-gray-900 text-center">
                        {isSigningUp ? "Join GearShare Community" : "Welcome Back"}
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    {isSigningUp && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                            <p className="mt-2 text-xs text-gray-500">You can borrow and lend immediately after signing up!</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                        >
                            {isSigningUp ? "Create Account" : "Sign In"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}