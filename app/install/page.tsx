"use client";

import { useState } from "react";
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
  const [success, setSuccess] = useState(false);

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

      // Redirect to OAuth authorization
      const authUrl = `${cleanUrl}/oauth/authorize?` + new URLSearchParams({
        client_id: "com.nexusvite.analytics",
        redirect_uri: `${window.location.origin}/api/auth/callback`,
        response_type: "code",
        scope: "read:users read:organizations read:apps read:transactions",
        state: Math.random().toString(36).substring(7),
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = authUrl;
      }, 1000);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

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
          {!success ? (
            <>
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
                    Installing...
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
                  <li>3. Authorize the app on your platform</li>
                  <li>4. Start using Analytics Dashboard</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Redirecting to authorization...</h3>
              <p className="text-sm text-muted-foreground">
                You will be redirected to your platform to authorize the app
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}