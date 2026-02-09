import { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import React from 'react';

export const metadata: Metadata = {
    title: 'Unauthorized',
};

const Unauthorized = () => {
    const router = useRouter(); 
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <div className="px-6 py-16 text-center font-semibold before:container before:absolute before:left-1/2 before:aspect-square before:-translate-x-1/2 before:rounded-full before:bg-[linear-gradient(180deg,#4361EE_0%,rgba(67,97,238,0)_50.73%)] before:opacity-10 md:py-20">
                <div className="relative">
                    <img src="/assets/images/error/401-Unauthorized.svg" alt="401" className="dark-img mx-auto -mt-10 w-full max-w-xs object-cover md:-mt-14 md:max-w-xl" />
                    <h1 className="mt-5 text-xl font-bold">Unauthorized Access</h1>
                    <p className="mt-2">You do not have permission to view this page. Please log in with appropriate credentials.</p>
                    <button onClick={() => router.back()} className="btn btn-gradient mx-auto !mt-7 w-max border-0 uppercase shadow-none">
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
