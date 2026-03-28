import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "cancel", "validate", "reject", "rebuild", "calculate",
    "getPdf", "deletePdf", "deleteXml",
    "createBasic", "addLines", "updateLine", "removeLines",
    "duplicate", "generate", "createAdjustment", "duplicateLines",
    "quarantine", "refreshRate", "calculateSubTotals",
    "validateMultiple", "quarantineMultiple", "rejectMultiple",
    "setCustomRate", "updateValidated",
  ]).describe("The invoice action to perform"),
  invoiceId: z.number().int().positive().optional()
    .describe("Invoice ID (required for most actions)"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
  generateIfMissing: z.boolean().optional()
    .describe("For getPdf: generate PDF if not already created"),
  invoiceNumber: z.string().optional()
    .describe("Invoice number (for lookup by number)"),
  invoiceTypeId: z.number().int().positive().optional()
    .describe("Invoice type ID (for matched operations lookup)"),
  lineId: z.number().int().positive().optional()
    .describe("Invoice line ID (for updateLine/removeLine actions)"),
};

export function registerInvoiceActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "invoice_actions",
    "Perform business operations on invoices: cancel, validate, reject, rebuild, calculate, get PDF, generate, duplicate, create adjustments, manage lines, and more.",
    inputSchema,
    async (params) => {
      try {
        const { action, invoiceId, data } = params;
        const basePath = "/billing/invoices";

        switch (action) {
          case "cancel":
            return mapResponseToResult(await client.put(`${basePath}/${invoiceId}/cancellation`, data));
          case "validate":
            return mapResponseToResult(await client.put(`${basePath}/${invoiceId}/validation`, data));
          case "reject":
            return mapResponseToResult(await client.put(`${basePath}/${invoiceId}/rejection`, data));
          case "rebuild":
            return mapResponseToResult(await client.put(`${basePath}/${invoiceId}/rebuild`, data));
          case "calculate":
            return mapResponseToResult(await client.put(`${basePath}/${invoiceId}/calculation`, data));
          case "getPdf": {
            const query: Record<string, string> = {};
            if (params.generateIfMissing) query.generateIfMissing = "true";
            return mapResponseToResult(await client.get(`${basePath}/${invoiceId}/pdf`, query));
          }
          case "deletePdf":
            return mapResponseToResult(await client.post(`${basePath}/${invoiceId}/deletePdfFile`));
          case "deleteXml":
            return mapResponseToResult(await client.post(`${basePath}/${invoiceId}/deleteXmlFile`));
          case "createBasic":
            return mapResponseToResult(await client.post(`${basePath}/basicInvoices`, data));
          case "addLines":
            return mapResponseToResult(await client.post(`${basePath}/${invoiceId}/invoiceLines`, data));
          case "updateLine":
            return mapResponseToResult(await client.put(`${basePath}/${invoiceId}/invoiceLines/${params.lineId}`, data));
          case "removeLines":
            return mapResponseToResult(await client.delete(`${basePath}/${invoiceId}/invoiceLines`));
          case "duplicate":
            return mapResponseToResult(await client.post(`${basePath}/${invoiceId}/duplication`, data));
          case "generate":
            return mapResponseToResult(await client.post(`${basePath}/generate`, data));
          case "createAdjustment":
            return mapResponseToResult(await client.post(`${basePath}/${invoiceId}/createAdjustment`, data));
          case "duplicateLines":
            return mapResponseToResult(await client.post(`${basePath}/${invoiceId}/invoiceLines/duplicate`, data));
          case "quarantine":
            return mapResponseToResult(await client.put(`${basePath}/${invoiceId}/quarantine`, data));
          case "refreshRate":
            return mapResponseToResult(await client.put(`${basePath}/${invoiceId}/refreshRate`));
          case "calculateSubTotals":
            return mapResponseToResult(await client.post(`${basePath}/${invoiceId}/calculateSubTotals`, data));
          case "validateMultiple":
            return mapResponseToResult(await client.put(`${basePath}/validation`, data));
          case "quarantineMultiple":
            return mapResponseToResult(await client.put(`${basePath}/quarantine`, data));
          case "rejectMultiple":
            return mapResponseToResult(await client.put(`${basePath}/rejection`, data));
          case "setCustomRate":
            return mapResponseToResult(await client.put(`${basePath}/${invoiceId}/setCustomRate`, data));
          case "updateValidated":
            return mapResponseToResult(await client.put(`${basePath}/validated/${invoiceId}`, data));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
