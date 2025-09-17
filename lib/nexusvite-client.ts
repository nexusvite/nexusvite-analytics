// NexusVite OAuth Client for SSO Integration
interface NexusViteConfig {
  clientId: string;
  clientSecret: string;
  platformUrl: string;
  redirectUri: string;
}

interface NexusViteUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  avatar?: string;
}

interface NexusViteSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: NexusViteUser;
}

export class NexusViteClient {
  private config: NexusViteConfig;

  constructor(config: Partial<NexusViteConfig>) {
    this.config = {
      clientId: config.clientId || process.env.NEXUSVITE_CLIENT_ID || '',
      clientSecret: config.clientSecret || process.env.NEXUSVITE_CLIENT_SECRET || '',
      platformUrl: config.platformUrl || process.env.NEXUSVITE_PLATFORM_URL || 'http://localhost:3000',
      redirectUri: config.redirectUri || process.env.NEXUSVITE_REDIRECT_URI || 'http://localhost:3001/api/auth/callback'
    };
  }

  // Generate OAuth authorization URL
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read:users read:organizations read:apps read:transactions',
      state: state || Math.random().toString(36).substring(7)
    });

    return `${this.config.platformUrl}/oauth/authorize?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<NexusViteSession> {
    const response = await fetch(`${this.config.platformUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      user: data.user
    };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<NexusViteSession> {
    const response = await fetch(`${this.config.platformUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      user: data.user
    };
  }

  // Get user info from access token
  async getUserInfo(accessToken: string): Promise<NexusViteUser> {
    const response = await fetch(`${this.config.platformUrl}/api/v1/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  // Make authenticated API request
  async apiRequest(endpoint: string, accessToken: string, options?: RequestInit) {
    const response = await fetch(`${this.config.platformUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Singleton instance
export const nexusViteClient = new NexusViteClient({});