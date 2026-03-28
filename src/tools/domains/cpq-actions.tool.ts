import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "getAvailableOpenOrders", "sendQuoteByEmail",
    "createBillingRule", "updateBillingRule", "deleteBillingRule",
  ]).describe("The CPQ action to perform"),
  code: z.string().optional()
    .describe("Quote code or contract code"),
  id: z.number().int().positive().optional()
    .describe("Billing rule ID (for update/delete)"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
};

export function registerCpqActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "cpq_actions",
    "CPQ operations: get available open orders for a quote, send quotes by email, manage contract billing rules.",
    inputSchema,
    async (params) => {
      try {
        const { action, code, id, data } = params;

        switch (action) {
          case "getAvailableOpenOrders":
            return mapResponseToResult(await client.get(`/cpq/quotes/${code}/availableOpenOrders`));
          case "sendQuoteByEmail":
            return mapResponseToResult(await client.post(`/cpq/quotes/sendByEmail`, data));
          case "createBillingRule":
            return mapResponseToResult(await client.post(`/cpq/contracts/${code}/billingRule`, data));
          case "updateBillingRule":
            return mapResponseToResult(await client.put(`/cpq/contracts/${code}/billingRule/${id}`, data));
          case "deleteBillingRule":
            return mapResponseToResult(await client.delete(`/cpq/contracts/${code}/billingRule/${id}`));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
