import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "findByCode",
  ]).describe("The order action to perform"),
  code: z.string().optional()
    .describe("Order code (for findByCode)"),
  id: z.number().int().positive().optional()
    .describe("Order ID"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
};

export function registerOrderActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "order_actions",
    "Order operations: find orders by code.",
    inputSchema,
    async (params) => {
      try {
        const { action, code } = params;
        const basePath = "/ordering/orders";

        switch (action) {
          case "findByCode":
            return mapResponseToResult(await client.get(`${basePath}/find/${code}`));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
