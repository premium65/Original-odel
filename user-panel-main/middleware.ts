import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest, res: NextResponse) {
  console.log("Res", res);
  // Access the token from localStorage
  const token = req.cookies.get("token")?.value;

  // Define the routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/", "/unauthorized"];

  // If the token is missing and the user is not on a public route, redirect to login
  if (!token && !publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  // Validate the token here if necessary
  // You can make an API call to validate the token, check expiration, etc.

  // If the token is valid, continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: ["/account-details", "/booking", "/about-us", "/event", "/booking-history", "/customer-service", "/crypto", "/deposit", "/event", "/help", "/level", "/deposit-fiat", "/wallet", "/withdraw"], // Define the routes where the middleware should run
};
