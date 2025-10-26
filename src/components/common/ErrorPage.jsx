import {CircleX, Home} from "lucide-react";
import {Link} from "react-router-dom";

export default function ErrorPage ({ message = "The page you requested could not be found." }) {
    return (
        <div className="py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <CircleX className="w-16 h-16 text-red-500 mb-4"/>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Error 404</h3>
            <p className="text-lg text-gray-600">{message}</p>
            <Link to="/" className="mt-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                <Home className="w-4 h-4 mr-1"/>
                Go to Homepage
            </Link>
        </div>
    )
}