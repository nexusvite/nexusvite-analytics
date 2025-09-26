import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { platformUrl } = await request.json();

    if (!platformUrl) {
      return NextResponse.json({
        hasInstallation: false,
        error: "Platform URL is required"
      }, { status: 400 });
    }

    // Try to get current platform session
    try {
      // First, check if user has an active session on the platform
      const sessionResponse = await fetch(`${platformUrl}/api/auth/session`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Cookie": request.headers.get("cookie") || "",
        },
      });

      if (!sessionResponse.ok) {
        return NextResponse.json({
          hasInstallation: false,
          reason: "No platform session"
        });
      }

      const sessionData = await sessionResponse.json();

      if (!sessionData.user) {
        return NextResponse.json({
          hasInstallation: false,
          reason: "User not authenticated on platform"
        });
      }

      // Check if this user has the analytics app installed
      const installationsResponse = await fetch(`${platformUrl}/api/apps?installed=true`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Cookie": request.headers.get("cookie") || "",
        },
      });

      if (!installationsResponse.ok) {
        return NextResponse.json({
          hasInstallation: false,
          reason: "Could not check installations"
        });
      }

      const { apps } = await installationsResponse.json();
      const analyticsInstallation = apps?.find(
        (app: any) => app.appId === "com.nexusvite.analytics"
      );

      if (analyticsInstallation) {
        // App is installed, return the installation details
        return NextResponse.json({
          hasInstallation: true,
          installation: analyticsInstallation,
          user: sessionData.user,
          sessionToken: sessionData.session?.token
        });
      }

      return NextResponse.json({
        hasInstallation: false,
        reason: "App not installed for this user"
      });

    } catch (error) {
      console.error("Error checking platform installation:", error);
      return NextResponse.json({
        hasInstallation: false,
        error: "Failed to check platform"
      });
    }
  } catch (error) {
    console.error("Error in auth check:", error);
    return NextResponse.json({
      hasInstallation: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}