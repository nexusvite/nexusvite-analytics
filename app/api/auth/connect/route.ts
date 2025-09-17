import { NextRequest, NextResponse } from "next/server";
import { nexusViteClient } from "@/lib/nexusvite-client";

export async function GET(request: NextRequest) {
  // Generate OAuth authorization URL and redirect
  const state = Math.random().toString(36).substring(7);

  // Store state in cookie for verification
  const response = NextResponse.redirect(nexusViteClient.getAuthorizationUrl(state));
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}