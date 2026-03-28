import type { HttpResponse } from "../http/opencell-client.js";

export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function mapResponseToResult(response: HttpResponse): ToolResult {
  const text = typeof response.data === "string"
    ? response.data
    : JSON.stringify(response.data, null, 2);

  if (response.status >= 200 && response.status < 300) {
    return {
      content: [{ type: "text", text }],
    };
  }

  const errorPrefix = getErrorPrefix(response.status);
  return {
    content: [{ type: "text", text: `${errorPrefix}\n\n${text}` }],
    isError: true,
  };
}

function getErrorPrefix(status: number): string {
  switch (status) {
    case 400: return "Bad Request (400): The request was invalid.";
    case 401: return "Unauthorized (401): Authentication failed.";
    case 403: return "Forbidden (403): Insufficient permissions.";
    case 404: return "Not Found (404): The requested resource was not found.";
    case 409: return "Conflict (409): The request conflicts with existing data.";
    case 422: return "Unprocessable Entity (422): Validation failed.";
    case 429: return "Too Many Requests (429): Rate limit exceeded.";
    case 500: return "Internal Server Error (500): The server encountered an error.";
    case 502: return "Bad Gateway (502): The server is unreachable.";
    case 503: return "Service Unavailable (503): The server is temporarily unavailable.";
    default: return `Error (${status}): Request failed.`;
  }
}

export function mapErrorToResult(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    isError: true,
  };
}
