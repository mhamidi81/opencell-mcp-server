import type { Config } from "../config.js";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type: string;
}

interface CachedToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  refreshExpiresAt?: number;
}

export class KeycloakClient {
  private cachedToken: CachedToken | null = null;
  private tokenUrl: string;

  constructor(private config: Config) {
    this.tokenUrl = `${config.keycloakUrl}/realms/${config.keycloakRealm}/protocol/openid-connect/token`;
  }

  async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.isTokenValid(this.cachedToken)) {
      return this.cachedToken.accessToken;
    }

    if (this.cachedToken?.refreshToken && this.isRefreshValid(this.cachedToken)) {
      try {
        await this.refreshAccessToken(this.cachedToken.refreshToken);
        return this.cachedToken!.accessToken;
      } catch {
        // Refresh failed, fall through to full auth
      }
    }

    await this.authenticate();
    return this.cachedToken!.accessToken;
  }

  private isTokenValid(token: CachedToken): boolean {
    return Date.now() < token.expiresAt - 30_000;
  }

  private isRefreshValid(token: CachedToken): boolean {
    if (!token.refreshExpiresAt) return false;
    return Date.now() < token.refreshExpiresAt - 30_000;
  }

  private async authenticate(): Promise<void> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.config.keycloakClientId,
      client_secret: this.config.keycloakClientSecret,
    });

    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Keycloak authentication failed (${response.status}): ${errorText}`);
    }

    const data: TokenResponse = await response.json() as TokenResponse;
    this.cacheToken(data);
  }

  private async refreshAccessToken(refreshToken: string): Promise<void> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.config.keycloakClientId,
      client_secret: this.config.keycloakClientSecret,
      refresh_token: refreshToken,
    });

    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed (${response.status})`);
    }

    const data: TokenResponse = await response.json() as TokenResponse;
    this.cacheToken(data);
  }

  private cacheToken(data: TokenResponse): void {
    const now = Date.now();
    this.cachedToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: now + data.expires_in * 1000,
      refreshExpiresAt: data.refresh_expires_in
        ? now + data.refresh_expires_in * 1000
        : undefined,
    };
  }
}
