import { NextRequest, NextResponse } from "next/server";
import { nexusViteClient } from "@/lib/nexusvite-client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get("installation_id");
  const platformUrl = searchParams.get("platform_url");
  const embedMode = searchParams.get("embed_mode");
  const userId = searchParams.get("user_id");

  // Generate OAuth authorization URL and redirect
  const state = Math.random().toString(36).substring(7);

  // Build the authorization URL with our callback URL
  const authUrl = nexusViteClient.getAuthorizationUrl(state);
  const url = new URL(authUrl);

  // Add our custom parameters to the redirect URI
  const callbackUrl = new URL(url.searchParams.get("redirect_uri") || "");
  if (installationId) callbackUrl.searchParams.set("installation_id", installationId);
  if (platformUrl) callbackUrl.searchParams.set("platform_url", platformUrl);
  if (embedMode) callbackUrl.searchParams.set("embed_mode", embedMode);
  if (userId) callbackUrl.searchParams.set("user_id", userId);

  url.searchParams.set("redirect_uri", callbackUrl.toString());

  // Store state and params in cookies for verification
  const response = NextResponse.redirect(url.toString());
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
  });

  // Store installation params for later use
  if (installationId) {
    response.cookies.set("pending_installation_id", installationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
    });
  }

  if (platformUrl) {
    response.cookies.set("pending_platform_url", platformUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
    });
  }

  if (embedMode) {
    response.cookies.set("pending_embed_mode", embedMode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
    });
  }

  return response;
}