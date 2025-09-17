import { NextRequest, NextResponse } from "next/server";
import { sessionManager } from "@/lib/session-manager";

export async function POST(request: NextRequest) {
  try {
    const { event, appId, userId, installationId } = await request.json();

    // Verify this is for our app
    if (event !== "app.uninstalled" || appId !== "com.nexusvite.analytics") {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    console.log(`App uninstalled for user ${userId}, marking session as revoked...`);

    // Mark this user's session as revoked
    sessionManager.revokeSession(userId);

    return NextResponse.json({
      success: true,
      message: "Uninstall notification received"
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}