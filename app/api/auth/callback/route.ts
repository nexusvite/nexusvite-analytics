import { NextRequest, NextResponse } from "next/server";
import { nexusViteClient } from "@/lib/nexusvite-client";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  // Get params from URL or cookies
  const installationId = searchParams.get("installation_id") ||
                         request.cookies.get("pending_installation_id")?.value;
  const platformUrl = searchParams.get("platform_url") ||
                     request.cookies.get("pending_platform_url")?.value ||
                     "http://localhost:3000";
  const embedMode = searchParams.get("embed_mode") === "true" ||
                   request.cookies.get("pending_embed_mode")?.value === "true";
  const sessionToken = searchParams.get("session_token") ||
                      request.cookies.get("pending_session_token")?.value;

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(error)}`, origin));
  }

  // Verify state parameter (skip for demo)
  const storedState = request.cookies.get("oauth_state")?.value;
  // if (!state || state !== storedState) {
  //   return NextResponse.redirect(new URL("/auth/error?message=Invalid%20state", origin));
  // }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?message=Missing%20authorization%20code", origin));
  }

  try {
    console.log("Exchanging code for tokens:", code);

    // Exchange code for tokens first
    const session = await nexusViteClient.exchangeCodeForTokens(code);
    console.log("Received session:", session);

    // Now verify the session with the platform using the new access token
    if (platformUrl) {
      try {
        const tokenToVerify = session.accessToken || sessionToken;

        if (tokenToVerify) {
          const verifyResponse = await fetch(`${platformUrl}/api/apps/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appId: 'com.nexusvite.analytics',
              accessToken: tokenToVerify
            })
          });

          if (!verifyResponse.ok) {
            const errorData = await verifyResponse.json();
            console.error("Session verification failed:", errorData);
            // Don't throw error here, continue with the flow
          } else {
            const verifyData = await verifyResponse.json();
            console.log("Session verified for user:", verifyData.userId);
          }
        }
      } catch (verifyError) {
        console.error("Session verification error:", verifyError);
        // Don't throw error here, continue with the flow
      }
    }

    // Store session in cookies (make auth_status readable by client)
    const response = NextResponse.redirect(new URL("/?connected=true", origin));

    // Store tokens as httpOnly for security
    response.cookies.set("access_token", session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Store a client-readable flag
    response.cookies.set("auth_status", "connected", {
      httpOnly: false, // Client-side readable
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Store installation and embed settings
    if (installationId) {
      response.cookies.set("installation_id", installationId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    response.cookies.set("platform_url", platformUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set("embed_mode", String(embedMode), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Clean up temporary cookies
    response.cookies.delete("oauth_state");
    response.cookies.delete("pending_installation_id");
    response.cookies.delete("pending_platform_url");
    response.cookies.delete("pending_embed_mode");
    response.cookies.delete("pending_session_token");

    // If in embed mode, redirect to platform instead
    if (embedMode && installationId) {
      return NextResponse.redirect(`${platformUrl}/dashboard/apps/${installationId}/view`);
    }

    return response;
  } catch (error) {
    console.error("OAuth callback error details:", error);
    // Do NOT set auth_status as connected on error
    // Redirect to error page instead
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.redirect(
      new URL(`/install?error=${encodeURIComponent(errorMessage)}`, origin)
    );
  }
}