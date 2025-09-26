"use client";

import { useEffect, useState, useCallback } from "react";
import { socketManager, initializeSocket, disconnectSocket } from "@/lib/socket";

interface UseSocketOptions {
  platformUrl?: string;
  userId?: string;
  installationId?: string;
  accessToken?: string;
  onLogout?: () => void;
  onAppUninstalled?: () => void;
  onReconnect?: () => void;
}

export function useSocket({
  platformUrl,
  userId,
  installationId,
  accessToken,
  onLogout,
  onAppUninstalled,
  onReconnect,
}: UseSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!platformUrl || !userId || !accessToken) {
      console.log("[useSocket] Missing required auth data");
      return;
    }

    console.log("[useSocket] Initializing socket connection");

    // Initialize socket connection
    const socket = initializeSocket(
      platformUrl,
      userId,
      installationId || "",
      accessToken
    );

    // Subscribe to events
    const unsubscribeAuth = socketManager.on("authenticated", (data) => {
      console.log("[useSocket] Authenticated:", data);
      setConnected(true);
      setError(null);
    });

    const unsubscribeError = socketManager.on("auth-error", (error) => {
      console.error("[useSocket] Auth error:", error);
      setError(error.message || "Authentication failed");
      setConnected(false);
    });

    const unsubscribeLogout = socketManager.on("logout", (data) => {
      console.log("[useSocket] Logout event:", data);
      setConnected(false);
      onLogout?.();
    });

    const unsubscribeUninstall = socketManager.on("app-uninstalled", (data) => {
      console.log("[useSocket] App uninstalled:", data);
      if (data.appId === "com.nexusvite.analytics") {
        setConnected(false);
        onAppUninstalled?.();
      }
    });

    const unsubscribeDisconnect = socketManager.on("disconnected", (data) => {
      console.log("[useSocket] Disconnected:", data);
      setConnected(false);
    });

    const unsubscribeLocalLogout = socketManager.on("local-logout", () => {
      console.log("[useSocket] Local logout");
      setConnected(false);
      onLogout?.();
    });

    // Cleanup function
    return () => {
      unsubscribeAuth();
      unsubscribeError();
      unsubscribeLogout();
      unsubscribeUninstall();
      unsubscribeDisconnect();
      unsubscribeLocalLogout();
      // Don't disconnect on unmount - let the manager handle it
    };
  }, [platformUrl, userId, installationId, accessToken, onLogout, onAppUninstalled]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    if (platformUrl && userId && accessToken) {
      console.log("[useSocket] Attempting reconnection");
      initializeSocket(platformUrl, userId, installationId || "", accessToken);
      onReconnect?.();
    }
  }, [platformUrl, userId, installationId, accessToken, onReconnect]);

  return {
    connected,
    error,
    disconnect,
    reconnect,
  };
}