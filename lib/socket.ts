import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export interface AuthEventData {
  userId?: string;
  installationId?: string;
  appId?: string;
  timestamp: number;
}

export interface SocketAuth {
  userId: string;
  installationId: string;
  accessToken: string;
}

class SocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;
  private authData: SocketAuth | null = null;

  connect(platformUrl: string, authData: SocketAuth) {
    if (this.socket?.connected || this.isConnecting) {
      console.log("[Socket] Already connected or connecting");
      return this.socket;
    }

    this.isConnecting = true;
    this.authData = authData;

    console.log("[Socket] Connecting to", platformUrl);

    this.socket = io(platformUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Setup event handlers
    this.socket.on("connect", () => {
      console.log("[Socket] Connected");
      this.isConnecting = false;

      // Authenticate immediately after connection
      if (this.authData) {
        this.socket!.emit("auth:connect", this.authData);
      }
    });

    this.socket.on("auth:connected", (data) => {
      console.log("[Socket] Authenticated:", data);
      this.emit("authenticated", data);
    });

    this.socket.on("auth:error", (error) => {
      console.error("[Socket] Auth error:", error);
      this.emit("auth-error", error);
    });

    // Listen for auth events
    this.socket.on("auth:logout", (data) => {
      console.log("[Socket] Logout event received:", data);
      this.emit("logout", data);

      // Clear local auth state
      this.clearAuth();
    });

    this.socket.on("auth:app-installed", (data) => {
      console.log("[Socket] App installed:", data);
      this.emit("app-installed", data);
    });

    this.socket.on("auth:app-uninstalled", (data) => {
      console.log("[Socket] App uninstalled:", data);
      this.emit("app-uninstalled", data);

      // If this is our app, clear auth
      if (data.appId === "com.nexusvite.analytics") {
        this.clearAuth();
      }
    });

    this.socket.on("auth:user-connected", (data) => {
      console.log("[Socket] User connected from another session:", data);
      this.emit("user-connected", data);
    });

    this.socket.on("auth:user-disconnected", (data) => {
      console.log("[Socket] User disconnected from another session:", data);
      this.emit("user-disconnected", data);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      this.isConnecting = false;
      this.emit("disconnected", { reason });
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("[Socket] Reconnected after", attemptNumber, "attempts");

      // Re-authenticate after reconnection
      if (this.authData) {
        this.socket!.emit("auth:connect", this.authData);
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log("[Socket] Disconnecting");
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.authData = null;
  }

  private clearAuth() {
    // Clear cookies
    document.cookie = "auth_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "installation_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "platform_url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "embed_mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Emit local logout event
    this.emit("local-logout", {});

    // Reload the page to show install screen
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Emit events to the server
  emitLogout(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit("auth:logout", { userId });
    }
  }

  emitAppInstalled(data: { userId: string; installationId: string; appId: string }) {
    if (this.socket?.connected) {
      this.socket.emit("app:installed", data);
    }
  }

  emitAppUninstalled(data: { userId: string; installationId: string; appId: string }) {
    if (this.socket?.connected) {
      this.socket.emit("app:uninstalled", data);
    }
  }
}

// Singleton instance
export const socketManager = new SocketManager();

// Helper function to initialize socket connection
export function initializeSocket(
  platformUrl: string,
  userId: string,
  installationId: string,
  accessToken: string
): Socket | null {
  return socketManager.connect(platformUrl, {
    userId,
    installationId,
    accessToken,
  });
}

// Helper function to disconnect
export function disconnectSocket() {
  socketManager.disconnect();
}