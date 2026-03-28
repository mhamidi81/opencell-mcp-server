import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "getFile", "getFileVersion", "updateFile", "updateFileVersion", "deleteFileVersion",
  ]).describe("The document action to perform"),
  code: z.string()
    .describe("Document code"),
  version: z.string().optional()
    .describe("Document version (for versioned operations)"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload (e.g., encoded file content)"),
  includingDocument: z.boolean().optional()
    .describe("For deleteFileVersion: also delete the document record"),
};

export function registerDocumentActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "document_actions",
    "Document file management: get, update, and delete document files with version support.",
    inputSchema,
    async (params) => {
      try {
        const { action, code, version, data } = params;
        const basePath = "/document";

        switch (action) {
          case "getFile":
            return mapResponseToResult(await client.get(`${basePath}/${code}/file`));
          case "getFileVersion":
            return mapResponseToResult(await client.get(`${basePath}/${code}/${version}/file`));
          case "updateFile":
            return mapResponseToResult(await client.put(`${basePath}/${code}/file`, data));
          case "updateFileVersion":
            return mapResponseToResult(await client.put(`${basePath}/${code}/${version}/file`, data));
          case "deleteFileVersion": {
            const query: Record<string, string> = {};
            if (params.includingDocument) query.includingDocument = "true";
            return mapResponseToResult(await client.delete(`${basePath}/${code}/${version}/file`, query));
          }
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
