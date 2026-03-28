import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "closeIndex", "enableIndex", "disableIndex", "createOrUpdateIndex",
    "validateBatch", "cancelBatch",
    "cancelPriceIndexation",
  ]).describe("The indexation action to perform"),
  code: z.string().optional()
    .describe("Index code (for close/enable/disable)"),
  id: z.number().int().positive().optional()
    .describe("Batch ID or price indexation ID"),
  batchId: z.number().int().positive().optional()
    .describe("Batch ID (for price indexation operations)"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
  force: z.boolean().optional()
    .describe("Force close index even if active"),
};

export function registerIndexationActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "indexation_actions",
    "Price indexation: manage indexes (close, enable, disable), validate/cancel batches, cancel price indexation lines.",
    inputSchema,
    async (params) => {
      try {
        const { action, code, id, batchId, data } = params;

        switch (action) {
          case "closeIndex": {
            const query: Record<string, string> = {};
            if (params.force) query.force = "true";
            return mapResponseToResult(await client.post(`/indexation/indexes/${code}/close`, data, query));
          }
          case "enableIndex":
            return mapResponseToResult(await client.post(`/indexation/indexes/${code}/enable`));
          case "disableIndex":
            return mapResponseToResult(await client.post(`/indexation/indexes/${code}/disable`));
          case "createOrUpdateIndex":
            return mapResponseToResult(await client.post(`/indexation/indexes/createOrUpdate`, data));
          case "validateBatch":
            return mapResponseToResult(await client.put(`/indexation/batches/${id}/validate`));
          case "cancelBatch":
            return mapResponseToResult(await client.put(`/indexation/batches/${id}/cancel`, data));
          case "cancelPriceIndexation":
            return mapResponseToResult(await client.put(`/indexation/batches/${batchId}/priceIndexations/${id}/cancel`, data));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
