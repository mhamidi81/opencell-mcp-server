import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "transferSubscription", "moveCustomerAccount", "moveBillingAccount",
    "createCounterInstance", "updateCounterInstance",
    "applyOneShotCharges", "getAllParentCustomers",
  ]).describe("The account management action to perform"),
  code: z.string().optional()
    .describe("Entity code (subscription code, customer account code, billing account code, or customer code)"),
  id: z.number().int().positive().optional()
    .describe("Entity ID (for counter instance update)"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
};

export function registerAccountActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "account_actions",
    "Account management operations: transfer subscriptions between accounts, move customer/billing accounts, manage counter instances, apply one-shot charges.",
    inputSchema,
    async (params) => {
      try {
        const { action, code, id, data } = params;
        const basePath = "/accountsManagement";

        switch (action) {
          case "transferSubscription":
            return mapResponseToResult(await client.post(`${basePath}/subscriptions/${code}/transfer`, data));
          case "moveCustomerAccount":
            return mapResponseToResult(await client.post(`${basePath}/customerAccounts/${code}/moving`, data));
          case "moveBillingAccount":
            return mapResponseToResult(await client.post(`${basePath}/billingAccounts/${code}/moving`, data));
          case "createCounterInstance":
            return mapResponseToResult(await client.post(`${basePath}/counterInstance`, data));
          case "updateCounterInstance":
            return mapResponseToResult(await client.put(`${basePath}/counterInstance/${id}`, data));
          case "applyOneShotCharges":
            return mapResponseToResult(await client.post(`${basePath}/subscriptions/applyOneShotChargeList`, data));
          case "getAllParentCustomers":
            return mapResponseToResult(await client.get(`${basePath}/customer/${code}/getAllParentCustomers`));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
