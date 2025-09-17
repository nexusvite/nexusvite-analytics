// Simple in-memory session manager for demo
// In production, use a database or Redis

class SessionManager {
  private revokedSessions = new Set<string>();

  revokeSession(userId: string) {
    this.revokedSessions.add(userId);
  }

  isSessionRevoked(userId: string): boolean {
    return this.revokedSessions.has(userId);
  }

  clearRevokedSession(userId: string) {
    this.revokedSessions.delete(userId);
  }
}

export const sessionManager = new SessionManager();