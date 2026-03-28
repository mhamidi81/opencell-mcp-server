import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "executeQuery", "verifyQuery", "getQueryResults", "downloadResults",
    "createScheduler", "getScheduler",
    "exportAgedReceivables",
  ]).describe("The reporting action to perform"),
  queryId: z.number().int().positive().optional()
    .describe("Report query ID"),
  resultId: z.number().int().positive().optional()
    .describe("Query execution result ID"),
  format: z.string().optional()
    .describe("Export format (CSV, EXCEL, PDF)"),
  locale: z.string().optional()
    .describe("Locale for export (default: EN)"),
  async: z.boolean().optional()
    .describe("Execute asynchronously"),
  sendNotification: z.boolean().optional()
    .describe("Send notification on completion"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
};

export function registerReportingActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "reporting_actions",
    "Reporting operations: execute report queries, verify queries, get/download results, manage schedulers, export aged receivables.",
    inputSchema,
    async (params) => {
      try {
        const { action, queryId, resultId, data } = params;

        switch (action) {
          case "executeQuery": {
            const query: Record<string, string> = {};
            if (params.async) query.async = "true";
            if (params.sendNotification) query.sendNotification = "true";
            return mapResponseToResult(await client.post(`/queryManagement/reportQueries/${queryId}/execute`, data, query));
          }
          case "verifyQuery":
            return mapResponseToResult(await client.post(`/queryManagement/reportQueries/verify`, data));
          case "getQueryResults":
            return mapResponseToResult(await client.get(`/queryManagement/reportQueries/queryExecutionResult/${resultId}/results`));
          case "downloadResults": {
            const query: Record<string, string> = {};
            if (params.format) query.format = params.format;
            return mapResponseToResult(await client.get(`/queryManagement/reportQueries/${queryId}/download`, query));
          }
          case "createScheduler":
            return mapResponseToResult(await client.post(`/queryManagement/reportQueries/${queryId}/schedule`, data));
          case "getScheduler":
            return mapResponseToResult(await client.get(`/queryManagement/reportQueries/${queryId}/schedule`));
          case "exportAgedReceivables": {
            const query: Record<string, string> = {};
            if (params.locale) query.locale = params.locale;
            return mapResponseToResult(await client.post(`/standardReports/AgedReceivables/export/${params.format || "CSV"}`, data, query));
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
