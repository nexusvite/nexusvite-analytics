import { NextRequest, NextResponse } from "next/server";
import { nexusViteClient } from "@/lib/nexusvite-client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect("/auth/error?message=" + encodeURIComponent(error));
  }

  // Verify state parameter
  const storedState = request.cookies.get("oauth_state")?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect("/auth/error?message=Invalid%20state");
  }

  if (!code) {
    return NextResponse.redirect("/auth/error?message=Missing%20authorization%20code");
  }

  try {
    // Exchange code for tokens
    const session = await nexusViteClient.exchangeCodeForTokens(code);

    // Store session in cookies (in production, use a proper session store)
    const response = NextResponse.redirect("/");
    response.cookies.set("access_token", session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    response.cookies.set("refresh_token", session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect("/auth/error?message=Authentication%20failed");
  }
}