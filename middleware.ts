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
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Check if running in iframe (embedded mode)
  const isInIframe = request.headers.get('sec-fetch-dest') === 'iframe' ||
                     request.headers.get('sec-fetch-mode') === 'navigate';

  // Get installation ID from cookies or session
  const cookies = request.cookies;
  const installationId = cookies.get('installation_id')?.value;
  const platformUrl = cookies.get('platform_url')?.value || 'http://localhost:3000';
  const embedMode = cookies.get('embed_mode')?.value === 'true';

  // If app is in embed mode and accessed directly (not in iframe)
  if (embedMode && !request.headers.get('referer')?.includes(platformUrl)) {
    // Check if this is a direct browser navigation (not iframe)
    const secFetchDest = request.headers.get('sec-fetch-dest');

    if (secFetchDest === 'document' || secFetchDest === 'navigate' || !secFetchDest) {
      // Get the current path
      const currentPath = request.nextUrl.pathname;

      // Redirect to platform with the app view URL
      if (installationId) {
        const redirectUrl = `${platformUrl}/dashboard/apps/${installationId}/view${currentPath}`;
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