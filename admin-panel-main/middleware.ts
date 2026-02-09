import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const publicRoutes = ['/login'];

    // If the token is missing and the user is not on a public route, redirect to login
    if (!token && !publicRoutes.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const headers = new Headers();
        if (token) headers.append("Authorization", token);

        // Fetch Admin Profile Data to get restriction info
        const profileResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/adminProfile`,
            { headers }
        );

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            const role = profileData.result?.role;
            const restrictions = profileData.result?.restriction || [];

            // If role is "superadmin", allow access to all paths
            if (role === "superadmin") {
                return NextResponse.next();
            }

            // Apply restricted path logic for "subadmin"
            if (role === "subadmin") {
                // Fetch Submodules Data
                const submodulesResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/submodules`,
                    { headers }
                );

                if (submodulesResponse.ok) {
                    const submodulesData = await submodulesResponse.json();
                    const subModules = submodulesData.result?.data || [];

                    // Filter submodules based on restrictions
                    const filteredModules = subModules.filter((submodule: any) => 
                        restrictions.includes(submodule._id)
                    ).map((submodule: any) => submodule.subModule);

                    // Define mapping between subModules and paths
                    const modulePaths: { [key: string]: string } = {
                        'Users': '/userList',
                        'Users Registration Request': '/userRegReq',
                        'Booking List': '/booking-list',
                        'Premium Booking List': '/premium-list',
                        'Premium List': '/premium-list',
                        'Premium History': '/premium-history',
                        'Address': '/addresses-list',
                        'Landmarks': '/landmarks-list',
                        'Event List': '/event-list',
                        'Bonus': '/bonus-history-list',
                        'Deposit': '/deposit-list',
                        'Withdraw': '/withdraw-list',
                        'Help': '/help-list',
                        'About': '/about-list',
                        'Policy': '/policy-list',
                        'Site setting': '/site-setting',
                        'Sub Admin': '/sub-admin',
                        'Sub Admin Logs': '/sub-admin-logs',
                        'Database Management': '/db-manage',
                        'Modules': '/modules',
                        'Sub Modules': '/sub-modules'
                    };

                    // Check if the request path is allowed for subadmin based on filteredModules
                    const currentPath = request.nextUrl.pathname;
                    const allowedPaths = filteredModules.map((module: any) => modulePaths[module]);

                    if (!allowedPaths.includes(currentPath)) {
                        // Redirect if the path is not allowed
                        return NextResponse.redirect(new URL('/unauthorized', request.url));
                    } else {
                        return NextResponse.next();
                    }
                } else {
                    console.error('Failed to load submodules data.');
                }
            }
        } else {
            console.error('Failed to load admin profile data.');
        }
    } catch (error) {
        console.error('An error occurred while fetching data:', error);
    }

    // Continue with the request if everything is validated
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard', '/userList', '/userRegReq', '/booking-list', '/premium-list', '/premium-history',
        '/addresses-list', '/landmarks-list', '/event-list', '/bonus-history-list', '/deposit-list',
        '/withdraw-list', '/help-list', '/about-list', '/policy-list', '/site-setting', '/sub-admin',
        '/add-admin', '/sub-admin-logs', '/modules', '/sub-modules', '/profile', '/2fa-settings',
        '/loginHistory', '/add-event', '/add-help', '/add-modules', '/add-submodules', '/addcms',
        '/bonus-add', '/bonus-edit', '/bonus-list', '/booking-add', '/booking-edit', '/change-user-password',
        '/edit-event', '/pre-booking-add', '/update-help', '/updatecms', '/userAsset', '/changePassword', '/db-manage'
    ],  // Define the routes where the middleware should run
};
