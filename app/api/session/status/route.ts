import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get authentication details from cookies
    const accessToken = request.cookies.get("access_token")?.value;
    const platformUrl = request.cookies.get("platform_url")?.value || "http://localhost:3000";

    // If no access token, session is invalid
    if (!accessToken) {
      const response = NextResponse.json({ connected: false, revoked: true });

      // Clear all auth cookies
      response.cookies.delete("auth_status");
      response.cookies.delete("access_token");
      response.cookies.delete("installation_id");
      response.cookies.delete("platform_url");
      response.cookies.delete("embed_mode");

      return response;
    }

    // Verify the session with the platform
    try {
      const verifyResponse = await fetch(`${platformUrl}/api/apps/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId: "com.nexusvite.analytics",
          accessToken: accessToken,
        }),
      });

      // If platform returns error, session is invalid
      if (!verifyResponse.ok) {
        const response = NextResponse.json({
          connected: false,
          revoked: true,
          reason: "Platform session invalid"
        });

        // Clear all auth cookies
        response.cookies.delete("auth_status");
        response.cookies.delete("access_token");
        response.cookies.delete("installation_id");
        response.cookies.delete("platform_url");
        response.cookies.delete("embed_mode");

        return response;
      }

      const data = await verifyResponse.json();

      // Check if app is still installed for this user
      if (!data.installed) {
        const response = NextResponse.json({
          connected: false,
          revoked: true,
          reason: "App not installed"
        });

        // Clear all auth cookies
        response.cookies.delete("auth_status");
        response.cookies.delete("access_token");
        response.cookies.delete("installation_id");
        response.cookies.delete("platform_url");
        response.cookies.delete("embed_mode");

        return response;
      }

      // Session is valid
      return NextResponse.json({
        connected: true,
        userId: data.userId,
        user: data.user
      });

    } catch (error) {
      console.error("Failed to verify session with platform:", error);
      // If we can't reach the platform, invalidate the session for security
      const response = NextResponse.json({
        connected: false,
        revoked: true,
        reason: "Platform unreachable"
      });

      // Clear all auth cookies
      response.cookies.delete("auth_status");
      response.cookies.delete("access_token");
      response.cookies.delete("installation_id");
      response.cookies.delete("platform_url");
      response.cookies.delete("embed_mode");

      return response;
    }
  } catch (error) {
    console.error("Error checking session status:", error);
    return NextResponse.json({ connected: false });
  }
}