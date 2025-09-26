"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Store, CheckCircle } from "lucide-react";

export default function InstallPage() {
  const [platformUrl, setPlatformUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingExisting, setCheckingExisting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for existing installation on component mount
  useEffect(() => {
    const checkExistingInstallation = async () => {
      // Get platform URL from localStorage
      const storedPlatformUrl = localStorage.getItem("platform_url");

      // If we have an error in the URL params, show it
      if (searchParams.get("error")) {
        setError(decodeURIComponent(searchParams.get("error") || ""));
        setPlatformUrl(storedPlatformUrl || "http://localhost:3000");
        setCheckingExisting(false);
        return;
      }

      // If we have a stored platform URL and not in embed mode, auto-connect
      // This handles the case where user is returning to the app
      const embedMode = searchParams.get("embed_mode") === "true";

      if (storedPlatformUrl && !embedMode) {
        setCheckingExisting(true);
        setPlatformUrl(storedPlatformUrl);

        // Automatically trigger OAuth flow
        // The platform will handle checking if user is authenticated and if app is installed
        const authUrl = `${storedPlatformUrl}/oauth/authorize?` + new URLSearchParams({
          client_id: "com.nexusvite.analytics",
          redirect_uri: `${window.location.origin}/api/auth/callback`,
          response_type: "code",
          scope: "read:users read:organizations read:apps read:transactions",
          state: Math.random().toString(36).substring(7),
        });

        // Small delay to show loading state
        setTimeout(() => {
          window.location.href = authUrl;
        }, 1000);
      } else {
        // Show the install form
        setPlatformUrl(storedPlatformUrl || "http://localhost:3000");
        setCheckingExisting(false);
      }
    };

    checkExistingInstallation();
  }, [searchParams]);

  const handleInstall = async () => {
    setError("");
    setLoading(true);

    try {
      // Validate URL
      if (!platformUrl) {
        throw new Error("Please enter your platform URL");
      }

      // Clean up the URL
      let cleanUrl = platformUrl.trim();
      if (!cleanUrl.startsWith("http")) {
        cleanUrl = `https://${cleanUrl}`;
      }

      // Remove trailing slash
      cleanUrl = cleanUrl.replace(/\/$/, "");

      // Validate it's a valid URL
      try {
        new URL(cleanUrl);
      } catch {
        throw new Error("Please enter a valid URL");
      }

      // Store the platform URL
      localStorage.setItem("platform_url", cleanUrl);

      // Immediately redirect to OAuth authorization - no success message
      // The platform will handle authentication and show appropriate messages
      const authUrl = `${cleanUrl}/oauth/authorize?` + new URLSearchParams({
        client_id: "com.nexusvite.analytics",
        redirect_uri: `${window.location.origin}/api/auth/callback`,
        response_type: "code",
        scope: "read:users read:organizations read:apps read:transactions",
        state: Math.random().toString(36).substring(7),
      });

      // Redirect immediately without showing success
      window.location.href = authUrl;

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Show loading state while checking for existing installation
  if (checkingExisting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Connecting to Platform</CardTitle>
            <CardDescription>
              Checking your authentication status...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Store className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Install Analytics Dashboard</CardTitle>
          <CardDescription>
            Connect your Analytics Dashboard to your NexusVite platform instance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform-url">Platform URL</Label>
            <Input
              id="platform-url"
              type="text"
              placeholder="https://your-platform.nexusvite.com"
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL of your NexusVite platform instance
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleInstall}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to platform...
              </>
            ) : (
              "Install App"
            )}
          </Button>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
            <h3 className="font-medium mb-2">Installation Steps:</h3>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Enter your NexusVite platform URL</li>
              <li>2. Click "Install App"</li>
              <li>3. Sign in to your platform account</li>
              <li>4. Authorize the app permissions</li>
              <li>5. Start using Analytics Dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}