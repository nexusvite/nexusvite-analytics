import { NextRequest, NextResponse } from "next/server";
import { sessionManager } from "@/lib/session-manager";

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ connected: false });
    }

    // Check if session is revoked locally first
    // Extract userId from token (for demo, token format: "access_user_{userId}_{timestamp}")
    const tokenParts = accessToken.split("_");
    const userId = tokenParts[2] || "user_1";

    if (sessionManager.isSessionRevoked(userId)) {
      // Clear the revoked flag and return disconnected
      sessionManager.clearRevokedSession(userId);
      return NextResponse.json({ connected: false });
    }

    // Verify with platform
    const response = await fetch("http://localhost:3000/api/apps/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appId: "com.nexusvite.analytics",
        accessToken: accessToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        connected: data.installed,
        userId: data.userId
      });
    } else {
      return NextResponse.json({ connected: false });
    }
  } catch (error) {
    console.error("Error verifying connection:", error);
    return NextResponse.json({ connected: false });
  }
}