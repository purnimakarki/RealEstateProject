import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require wallet connection
const PROTECTED_PATHS = [
  '/page/buy',
  '/page/sell',
  '/page/property',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  // If it's a protected path, check for wallet connection
  if (isProtectedPath) {
    // Check if wallet is connected (using cookies)
    const isWalletConnected = request.cookies.get('walletConnected')?.value === 'true';
    
    if (!isWalletConnected) {
      // Redirect to home page with a message
      const url = new URL('/', request.url);
      url.searchParams.set('walletRequired', 'true');
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/page/buy/:path*',
    '/page/sell/:path*',
    '/page/property/:path*',
  ],
};