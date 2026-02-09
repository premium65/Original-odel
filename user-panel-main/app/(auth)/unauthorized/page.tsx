import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Unauthorized',
};

const Unauthorized = () => {
    return (
            <div className="px-6 py-14 text-center font-semibold">
                <div className="relative">
                    <Image width={500} height={500} src="./error/401-Unauthorized.svg" alt="401" className="mx-auto -mt-10 w-3/4 h-3/4 md:-mt-14 md:max-w-xl" />
                    <h1 className="mt-5 text-xl font-bold">Unauthorized Access</h1>
                    <p className="mt-2">You do not have permission to view this page. Please log in with appropriate credentials.</p>
                    <div className='my-5'>
                    <Link href="/login"  className="bg-[#ec742b] hover:bg-[#fd9256] text-white text-sm py-2 px-5 rounded">
                        Login
                    </Link>
                    </div>
                </div>
                </div>

    );
};

export default Unauthorized;
