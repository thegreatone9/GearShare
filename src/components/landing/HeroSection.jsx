import {useNavigate} from "react-router-dom";

export default function HeroSection () {
    const navigate = useNavigate();

    return (
        <div className="relative isolate overflow-hidden checked-pattern-indigo-vert pt-20 pb-16 sm:pb-24 lg:pb-32 rounded-t-2xl">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    {/* Main Headline */}
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        <span className="block text-indigo-600">Borrow or Lend.</span>
                        Your Community's Inventory.
                    </h2>
                    {/* Subtitle / Value Proposition */}
                    <p className="mt-6 text-lg leading-8 text-gray-600">
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
                            className="text-base font-semibold leading-6 text-gray-900 border border-indigo-600 rounded-md px-4 py-2 transition duration-150"
                        >
                            List Your Gear <span aria-hidden="true">→</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}