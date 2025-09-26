"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "An authentication error occurred";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem connecting to your NexusVite platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{decodeURIComponent(message)}</AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h3 className="font-medium">Common issues:</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• You may not be logged in to the platform</li>
              <li>• The platform URL might be incorrect</li>
              <li>• Your session may have expired</li>
              <li>• You may have denied the authorization request</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/install">
              <Button className="w-full" variant="default">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full" variant="outline">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}