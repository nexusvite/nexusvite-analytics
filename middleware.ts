import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Skip for install and auth pages
  if (
    request.nextUrl.pathname === '/install' ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/auth')
  ) {
    return NextResponse.next();
  }

  // Check for embedded mode parameters in URL
  const embedMode = request.nextUrl.searchParams.get('embed_mode');
  const sessionToken = request.nextUrl.searchParams.get('session_token');
  const installationId = request.nextUrl.searchParams.get('installation_id');
  const platformUrl = request.nextUrl.searchParams.get('platform_url');
  const userId = request.nextUrl.searchParams.get('user_id');
  const accessToken = request.nextUrl.searchParams.get('access_token');

  // If we have embedded mode parameters, set cookies WITHOUT redirecting (for iframe)
  if (embedMode === 'true' && sessionToken && installationId && platformUrl) {
    // Check if this is an iframe request
    const isInIframe = request.headers.get('sec-fetch-dest') === 'iframe';

    // For iframe requests, set cookies without redirect to preserve parameters
    const response = isInIframe
      ? NextResponse.next()
      : NextResponse.redirect(new URL(request.nextUrl.pathname, request.url));

    // Set authentication cookies for embedded mode
    response.cookies.set('auth_status', 'connected', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    response.cookies.set('access_token', accessToken || sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    response.cookies.set('installation_id', installationId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    // Set user ID if provided
    if (userId) {
      response.cookies.set('user_id', userId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });
    }

    response.cookies.set('platform_url', platformUrl, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    response.cookies.set('embed_mode', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    return response;
  }

  // Check for authentication
  const authStatus = request.cookies.get('auth_status')?.value;
  const storedAccessToken = request.cookies.get('access_token')?.value;
  const isEmbedMode = request.cookies.get('embed_mode')?.value === 'true';

  // Check if running in iframe
  const isInIframe = request.headers.get('sec-fetch-dest') === 'iframe';
  const referer = request.headers.get('referer');
  const isFromPlatform = referer?.includes('localhost:3000');

  // If running in iframe from platform in embed mode, skip auth check
  // The platform handles auth for embedded apps
  if (isEmbedMode && isInIframe && isFromPlatform) {
    return NextResponse.next();
  }

  // If no auth status or access token, redirect to install page
  if (!authStatus || authStatus !== 'connected' || !storedAccessToken) {
    const installUrl = new URL('/install', request.url);
    installUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(installUrl);
  }

  // Get installation ID from cookies or session
  const cookies = request.cookies;
  const storedInstallationId = cookies.get('installation_id')?.value;
  const storedPlatformUrl = cookies.get('platform_url')?.value || 'http://localhost:3000';
  const storedEmbedMode = cookies.get('embed_mode')?.value === 'true';

  // If app is in embed mode and accessed directly (not in iframe)
  if (storedEmbedMode && !request.headers.get('referer')?.includes(storedPlatformUrl)) {
    // Check if this is a direct browser navigation (not iframe)
    const secFetchDest = request.headers.get('sec-fetch-dest');

    if (secFetchDest === 'document' || secFetchDest === 'navigate' || !secFetchDest) {
      // Get the current path
      const currentPath = request.nextUrl.pathname;

      // Redirect to platform with the app view URL
      if (storedInstallationId) {
        const redirectUrl = `${storedPlatformUrl}/dashboard/apps/${storedInstallationId}/view${currentPath}`;
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - install (installation page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|install).*)',
  ],
};