import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  entityName: z.string().min(1)
    .describe("Entity name to describe (e.g., 'Invoice', 'Customer'). Use list_entities to discover available names."),
  depth: z.number().int().min(0).max(5).default(1)
    .describe("Depth of nested entity fields to include (0 = flat fields only, 1+ = include related entities)"),
  filter: z.string().default("")
    .describe("Optional keyword to filter field names"),
};

export function registerDescribeEntityTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "describe_entity",
    "Get the field names, types, and relationships for a specific entity. Use this to understand what fields to pass when creating or updating entities, or what fields you can filter on when listing.",
    inputSchema,
    async (params) => {
      try {
        const queryParams: Record<string, string> = {
          depth: String(params.depth),
          filter: params.filter,
        };

        const response = await client.get(
          `/generic/entities/${params.entityName}`,
          queryParams,
        );
        return mapResponseToResult(response);
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
