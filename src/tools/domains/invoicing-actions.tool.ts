import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "createExceptionalBillingRun", "advanceStatus", "cancelBillingRun",
    "closeInvoiceLines", "enableBillingRun", "disableBillingRun",
  ]).describe("The billing run action to perform"),
  billingRunId: z.number().int().positive().optional()
    .describe("Billing run ID (required for most actions)"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
  executeInvoicingJob: z.boolean().optional()
    .describe("Whether to execute the invoicing job (for advanceStatus, closeInvoiceLines)"),
};

export function registerInvoicingActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "invoicing_actions",
    "Manage billing runs: create exceptional runs, advance status, cancel, close invoice lines, enable/disable.",
    inputSchema,
    async (params) => {
      try {
        const { action, billingRunId, data } = params;
        const basePath = "/billing/invoicing";
        const query: Record<string, string> = {};
        if (params.executeInvoicingJob !== undefined) {
          query.executeInvoicingJob = String(params.executeInvoicingJob);
        }

        switch (action) {
          case "createExceptionalBillingRun":
            return mapResponseToResult(await client.post(`${basePath}/exceptionalBillingRun`, data));
          case "advanceStatus":
            return mapResponseToResult(await client.put(`${basePath}/${billingRunId}/advanceStatus`, data, query));
          case "cancelBillingRun":
            return mapResponseToResult(await client.post(`${basePath}/${billingRunId}/cancelBillingRun`, data));
          case "closeInvoiceLines":
            return mapResponseToResult(await client.put(`${basePath}/${billingRunId}/closeInvoiceLines`, data, query));
          case "enableBillingRun":
            return mapResponseToResult(await client.post(`${basePath}/${billingRunId}/enableBillingRun`));
          case "disableBillingRun":
            return mapResponseToResult(await client.post(`${basePath}/${billingRunId}/disableBillingRun`));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
