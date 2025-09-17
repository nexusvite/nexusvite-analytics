import { NextRequest, NextResponse } from "next/server";
import { sessionManager } from "@/lib/session-manager";

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ connected: false });
    }

    // Extract userId from token (for demo, token format: "access_user_{userId}_{timestamp}")
    const tokenParts = accessToken.split("_");
    const userId = tokenParts[2] || "user_1";

    // Check if session is revoked
    if (sessionManager.isSessionRevoked(userId)) {
      // Clear cookies and return disconnected
      const response = NextResponse.json({ connected: false, revoked: true });

      response.cookies.set("auth_status", "", {
        expires: new Date(0),
        path: "/",
      });

      response.cookies.set("access_token", "", {
        expires: new Date(0),
        path: "/",
      });

      sessionManager.clearRevokedSession(userId);
      return response;
    }

    return NextResponse.json({ connected: true });
  } catch (error) {
    console.error("Error checking session status:", error);
    return NextResponse.json({ connected: false });
  }
}