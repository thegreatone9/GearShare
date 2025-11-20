import {useNavigate} from "react-router-dom";

export default function HeroSection () {
    const navigate = useNavigate();

    return (
        <div className="relative isolate overflow-hidden pt-20 pb-16 sm:pb-24 lg:pb-32 rounded-t-2xl">
            {/* --- VIDEO CONTAINER (z-0) --- */}
            {/* Needs to be contained by the parent and sit at the back. */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="https://placehold.co/1920x1080/4F46E5/ffffff?text=Video+Poster"
                    className="w-full h-full object-cover opacity-50" // Reduced opacity for subtlety
                >
                    <source src="https://tmuiycpixqjawkspqpiu.supabase.co/storage/v1/object/public/GearShare%20Assets/landing-page.webm" type="video/webm" />
                    <source src="https://tmuiycpixqjawkspqpiu.supabase.co/storage/v1/object/public/GearShare%20Assets/landing-page.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                {/* Optional: Add a subtle overlay to help text contrast */}
                <div className="absolute inset-0 bg-gray-900 opacity-30"></div>
            </div>

            {/* --- CONTENT CONTAINER --- */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl text-center">
                    {/* Main Headline */}
                    <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
                        <span className="block text-indigo-600">Borrow or Lend.</span>
                        Your Community's Inventory.
                    </h2>
                    {/* Subtitle / Value Proposition */}
                    <p className="mt-6 text-lg leading-8 text-white font-medium">
                        Get the gear you need, from drones to drills, without the cost of buying.
                        Monetize your unused items safely with our integrated security deposit protection.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg
                       hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-150"
                        >
                            Browse Items
                        </button>
                        <button
                            onClick={() => navigate('/auth')}
                            className="text-base bg-white font-semibold leading-6 text-gray-900 border border-indigo-600 rounded-md px-4 py-2 transition duration-150"
                        >
                            List Your Gear <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}