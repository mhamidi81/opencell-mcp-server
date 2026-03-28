import type { Config } from "../config.js";
import { KeycloakClient } from "../auth/keycloak-client.js";

export interface HttpResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

export class OpencellClient {
  private baseUrl: string;
  private keycloak: KeycloakClient;
  private timeoutMs: number;

  constructor(private config: Config) {
    this.baseUrl = `${config.opencellBaseUrl}/${config.opencellApiVersion}`;
    this.keycloak = new KeycloakClient(config);
    this.timeoutMs = config.requestTimeoutMs;
  }

  async get(path: string, queryParams?: Record<string, string>): Promise<HttpResponse> {
    return this.request("GET", path, undefined, queryParams);
  }

  async post(path: string, body?: unknown, queryParams?: Record<string, string>): Promise<HttpResponse> {
    return this.request("POST", path, body, queryParams);
  }

  async put(path: string, body?: unknown, queryParams?: Record<string, string>): Promise<HttpResponse> {
    return this.request("PUT", path, body, queryParams);
  }

  async delete(path: string, queryParams?: Record<string, string>): Promise<HttpResponse> {
    return this.request("DELETE", path, undefined, queryParams);
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
    queryParams?: Record<string, string>,
    isRetry = false,
  ): Promise<HttpResponse> {
    const token = await this.keycloak.getAccessToken();
    const url = this.buildUrl(path, queryParams);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (response.status === 401 && !isRetry) {
        return this.request(method, path, body, queryParams, true);
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data: unknown;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return { status: response.status, data, headers: responseHeaders };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`Request timed out after ${this.timeoutMs}ms: ${method} ${path}`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(path: string, queryParams?: Record<string, string>): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }
}
