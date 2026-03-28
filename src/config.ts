import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(): void {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env file not found, ignore
  }
}

loadDotEnv();

export interface Config {
  opencellBaseUrl: string;
  opencellApiVersion: string;
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  keycloakClientSecret: string;
  mcpTransport: "stdio" | "http";
  mcpHttpPort: number;
  defaultPageSize: number;
  maxPageSize: number;
  requestTimeoutMs: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export function loadConfig(): Config {
  return {
    opencellBaseUrl: getEnvOrThrow("OPENCELL_BASE_URL").replace(/\/$/, ""),
    opencellApiVersion: getEnvOrDefault("OPENCELL_API_VERSION", "v2"),
    keycloakUrl: getEnvOrThrow("KEYCLOAK_URL").replace(/\/$/, ""),
    keycloakRealm: getEnvOrThrow("KEYCLOAK_REALM"),
    keycloakClientId: getEnvOrThrow("KEYCLOAK_CLIENT_ID"),
    keycloakClientSecret: getEnvOrThrow("KEYCLOAK_CLIENT_SECRET"),
    mcpTransport: getEnvOrDefault("MCP_TRANSPORT", "stdio") as "stdio" | "http",
    mcpHttpPort: parseInt(getEnvOrDefault("MCP_HTTP_PORT", "3000"), 10),
    defaultPageSize: parseInt(getEnvOrDefault("MCP_DEFAULT_PAGE_SIZE", "50"), 10),
    maxPageSize: parseInt(getEnvOrDefault("MCP_MAX_PAGE_SIZE", "500"), 10),
    requestTimeoutMs: parseInt(getEnvOrDefault("MCP_REQUEST_TIMEOUT_MS", "30000"), 10),
    logLevel: getEnvOrDefault("MCP_LOG_LEVEL", "info") as Config["logLevel"],
  };
}
