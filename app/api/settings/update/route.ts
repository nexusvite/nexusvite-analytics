import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { embedMode, platformUrl } = await req.json();

    // Get access token from cookie
    const cookies = req.cookies;
    const accessToken = cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // In production, you would update these settings on the platform
    // For now, we'll just return success
    // const platformResponse = await fetch(`${platformUrl}/api/apps/settings`, {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     appId: 'com.nexusvite.analytics',
    //     settings: { embedMode }
    //   }),
    // });

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      settings: { embedMode, platformUrl }
    });

    // Set cookies for middleware to use
    response.cookies.set('embed_mode', String(embedMode), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    if (platformUrl) {
      response.cookies.set('platform_url', platformUrl, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}