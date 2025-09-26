"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/utils";

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const router = useRouter();

  // Get auth data from cookies
  const platformUrl = getCookie("platform_url");
  const userId = getCookie("user_id");
  const installationId = getCookie("installation_id");
  const accessToken = getCookie("access_token");

  const { connected, error } = useSocket({
    platformUrl: platformUrl || undefined,
    userId: userId || undefined,
    installationId: installationId || undefined,
    accessToken: accessToken || undefined,
    onLogout: () => {
      console.log("[SocketProvider] Handling logout event");
      // Clear cookies and redirect to install page
      document.cookie = "auth_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "installation_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "platform_url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "embed_mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      router.push("/");
    },
    onAppUninstalled: () => {
      console.log("[SocketProvider] App was uninstalled");
      // Clear cookies and redirect to install page
      document.cookie = "auth_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "installation_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "platform_url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "embed_mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      router.push("/");
    },
    onReconnect: () => {
      console.log("[SocketProvider] Reconnected to platform");
    },
  });

  useEffect(() => {
    if (connected) {
      console.log("[SocketProvider] WebSocket connected to platform");
    }
    if (error) {
      console.error("[SocketProvider] WebSocket error:", error);
    }
  }, [connected, error]);

  return <>{children}</>;
}