export default function TrustSection() {
    return (
        <div className="py-16 sm:py-24 bg-indigo-circles rounded-b-2xl">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <h3 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-12">
                    How GearShare Keeps Everything Secure
                </h3>
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
                    {/* Feature 1: Deposit */}
                    <div className="flex flex-col items-center text-center p-6 bg-indigo-50 rounded-xl shadow-inner">
                        <dt className="text-xl font-semibold leading-7 text-gray-900">
                            Secure Deposits
                        </dt>
                        <dd className="mt-2 text-base leading-7 text-gray-600">
                            A refundable security deposit is held for all high-value items, protecting the lender against minor damages.
                        </dd>
                    </div>

                    {/* Feature 2: Verification */}
                    <div className="flex flex-col items-center text-center p-6 bg-indigo-50 rounded-xl shadow-inner">
                        <dt className="text-xl font-semibold leading-7 text-gray-900">
                            Verified Community
                        </dt>
                        <dd className="mt-2 text-base leading-7 text-gray-600">
                            All borrowers and lenders undergo basic identity verification to build a trustworthy and safe network.
                        </dd>
                    </div>

                    {/* Feature 3: AI Judge MVP */}
                    <div className="flex flex-col items-center text-center p-6 bg-indigo-50 rounded-xl shadow-inner">
                        <dt className="text-xl font-semibold leading-7 text-gray-900">
                            Instant Dispute Resolution
                        </dt>
                        <dd className="mt-2 text-base leading-7 text-gray-600">
                            Our automated system rapidly evaluates evidence for loss or damage, ensuring fast and fair payouts based on clear policies.
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}