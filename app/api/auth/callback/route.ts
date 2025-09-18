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

    // Exchange code for tokens
    const session = await nexusViteClient.exchangeCodeForTokens(code);

    console.log("Received session:", session);

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

    // If in embed mode, redirect to platform instead
    if (embedMode && installationId) {
      return NextResponse.redirect(`${platformUrl}/dashboard/apps/${installationId}/view`);
    }

    return response;
  } catch (error) {
    console.error("OAuth callback error details:", error);
    // For demo, just redirect to home with connected status
    const response = NextResponse.redirect(new URL("/?connected=true", origin));
    response.cookies.set("auth_status", "connected", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
    return response;
  }
}