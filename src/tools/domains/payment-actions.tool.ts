import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "payByCard", "payBySepa",
    "createRejectionCode", "updateRejectionCode", "deleteRejectionCode",
    "importRejectionCodes", "exportRejectionCodes", "clearAllRejectionCodes",
    "createRejectionAction", "updateRejectionAction", "deleteRejectionAction",
    "createRejectionGroup", "updateRejectionGroup", "deleteRejectionGroup",
    "updateActionSequence",
    "createRejectionPayment", "retryPayment",
  ]).describe("The payment action to perform"),
  id: z.number().int().positive().optional()
    .describe("Resource ID (for update/delete/retry operations)"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
};

export function registerPaymentActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "payment_actions",
    "Process payments (card, SEPA), manage rejection codes/actions/groups, retry failed payments.",
    inputSchema,
    async (params) => {
      try {
        const { action, id, data } = params;
        const basePath = "/payment";

        switch (action) {
          case "payByCard":
            return mapResponseToResult(await client.post(`${basePath}/paymentByCard`, data));
          case "payBySepa":
            return mapResponseToResult(await client.post(`${basePath}/paymentBySepa`, data));
          case "createRejectionCode":
            return mapResponseToResult(await client.post(`${basePath}/rejectionCodes`, data));
          case "updateRejectionCode":
            return mapResponseToResult(await client.put(`${basePath}/rejectionCodes/${id}`, data));
          case "deleteRejectionCode":
            return mapResponseToResult(await client.delete(`${basePath}/rejectionCodes/${id}`));
          case "importRejectionCodes":
            return mapResponseToResult(await client.post(`${basePath}/rejectionCodes/import`, data));
          case "exportRejectionCodes":
            return mapResponseToResult(await client.post(`${basePath}/rejectionCodes/export`, data));
          case "clearAllRejectionCodes":
            return mapResponseToResult(await client.delete(`${basePath}/rejectionCodes/clearAll`));
          case "createRejectionAction":
            return mapResponseToResult(await client.post(`${basePath}/rejectionCodes/rejectionActions`, data));
          case "updateRejectionAction":
            return mapResponseToResult(await client.put(`${basePath}/rejectionCodes/rejectionActions/${id}`, data));
          case "deleteRejectionAction":
            return mapResponseToResult(await client.delete(`${basePath}/rejectionCodes/rejectionActions/${id}`));
          case "createRejectionGroup":
            return mapResponseToResult(await client.post(`${basePath}/rejectionCodes/group`, data));
          case "updateRejectionGroup":
            return mapResponseToResult(await client.put(`${basePath}/rejectionCodes/group/${id}`, data));
          case "deleteRejectionGroup":
            return mapResponseToResult(await client.delete(`${basePath}/rejectionCodes/group/${id}`));
          case "updateActionSequence":
            return mapResponseToResult(await client.put(`${basePath}/rejectionCodes/rejectionActions/${id}/UpdateSequence`, data));
          case "createRejectionPayment":
            return mapResponseToResult(await client.post(`${basePath}/rejection`, data));
          case "retryPayment":
            return mapResponseToResult(await client.post(`${basePath}/${id}/retry`, data));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
