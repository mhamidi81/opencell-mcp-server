import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  onlyBusinessEntities: z.boolean().default(false)
    .describe("If true, only return entities extending BusinessEntity (those with a 'code' field)"),
  withFullName: z.boolean().default(false)
    .describe("If true, return fully qualified class names instead of simple names"),
};

export function registerListEntitiesTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "list_entities",
    "List all queryable entity names in the Opencell system. Use this to discover what entities are available before using generic_list, generic_get, generic_create, or generic_update.",
    inputSchema,
    async (params) => {
      try {
        const queryParams: Record<string, string> = {};
        if (params.onlyBusinessEntities) queryParams.onlyBusinessEntities = "true";
        if (params.withFullName) queryParams.withFullName = "true";

        const response = await client.get("/generic/entities", queryParams);
        return mapResponseToResult(response);
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
