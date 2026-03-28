import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "listCdrs", "getCdr", "createCdr", "updateCdr", "deleteCdr",
  ]).describe("The mediation action to perform"),
  id: z.number().int().positive().optional()
    .describe("CDR ID"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
};

export function registerMediationActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "mediation_actions",
    "Mediation operations: manage CDRs (Charge Detail Records) for rating and billing.",
    inputSchema,
    async (params) => {
      try {
        const { action, id, data } = params;
        const basePath = "/mediation/cdrs";

        switch (action) {
          case "listCdrs":
            return mapResponseToResult(await client.get(basePath));
          case "getCdr":
            return mapResponseToResult(await client.get(`${basePath}/${id}`));
          case "createCdr":
            return mapResponseToResult(await client.post(basePath, data));
          case "updateCdr":
            return mapResponseToResult(await client.put(`${basePath}/${id}`, data));
          case "deleteCdr":
            return mapResponseToResult(await client.delete(`${basePath}/${id}`));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
