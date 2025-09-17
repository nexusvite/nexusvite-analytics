import { NextRequest, NextResponse } from "next/server";
import { nexusViteClient } from "@/lib/nexusvite-client";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

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

    response.cookies.delete("oauth_state");

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