"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  ExternalLink,
  Frame,
  Save,
  ArrowLeft,
  Info,
  Link as LinkIcon,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [embedMode, setEmbedMode] = useState(false);
  const [platformUrl, setPlatformUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load current settings
    const storedEmbedMode = localStorage.getItem("embed_mode");
    const storedPlatformUrl = localStorage.getItem("platform_url");

    setEmbedMode(storedEmbedMode === "true");
    setPlatformUrl(storedPlatformUrl || "");

    // Check connection status
    const cookies = document.cookie.split(';');
    const hasAuthStatus = cookies.some(cookie =>
      cookie.trim().startsWith('auth_status=connected')
    );
    setIsConnected(hasAuthStatus);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaved(false);

    try {
      // Save settings locally
      localStorage.setItem("embed_mode", embedMode.toString());

      // If connected to platform, update settings there
      if (isConnected && platformUrl) {
        const response = await fetch("/api/settings/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embedMode,
            platformUrl,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update settings");
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Settings - Not Connected</CardTitle>
              <CardDescription>
                Please connect to a NexusVite platform to configure settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/install">
                <Button className="w-full">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Connect to Platform
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span className="text-lg font-semibold">Settings</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Display Mode Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Display Mode</CardTitle>
            <CardDescription>
              Configure how the analytics dashboard appears in the NexusVite platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="embed-mode" className="text-base">
                  Embedded Mode
                </Label>
                <div className="text-sm text-muted-foreground">
                  Display analytics directly within the platform interface
                </div>
              </div>
              <Switch
                id="embed-mode"
                checked={embedMode}
                onCheckedChange={setEmbedMode}
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {embedMode ? (
                  <>
                    <strong>Embedded Mode:</strong> The analytics dashboard will appear as an
                    integrated part of the NexusVite platform interface. Users won't need to
                    switch between windows.
                  </>
                ) : (
                  <>
                    <strong>External Window Mode:</strong> The analytics dashboard will open in
                    a new browser tab or window when accessed from the platform.
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                {embedMode ? <Frame className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                Current Mode: {embedMode ? "Embedded" : "External Window"}
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {embedMode ? (
                  <>
                    <li>✓ Seamless integration with platform</li>
                    <li>✓ Consistent user experience</li>
                    <li>✓ No context switching</li>
                    <li>✓ Shared navigation and headers</li>
                  </>
                ) : (
                  <>
                    <li>✓ Full-screen analytics view</li>
                    <li>✓ Independent browser controls</li>
                    <li>✓ Can be used on multiple monitors</li>
                    <li>✓ Direct URL access</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Platform Connection Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Platform Connection</CardTitle>
            <CardDescription>
              Current connection details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Platform URL</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {platformUrl || "Not configured"}
                </p>
              </div>
              <div>
                <Label className="text-sm">Connection Status</Label>
                <p className="text-sm text-green-600 mt-1">
                  ✓ Connected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}