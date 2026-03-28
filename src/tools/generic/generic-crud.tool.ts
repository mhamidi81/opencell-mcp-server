import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";
import { formatPaginatedResponse } from "../../utils/pagination.js";
import { successResult } from "../../utils/response-formatter.js";
import {
  EntityNameSchema,
  EntityIdSchema,
  FilterSchema,
  PaginationSchema,
  FieldSelectionSchema,
} from "../../schemas/common.js";

export function registerGenericCrudTools(server: McpServer, client: OpencellClient): void {
  // ── generic_list ──────────────────────────────────────────────────
  server.tool(
    "generic_list",
    "List/search any entity with filtering, sorting, and pagination. Use list_entities to discover entity names and describe_entity to learn available fields.",
    {
      entityName: EntityNameSchema,
      filters: FilterSchema,
      ...PaginationSchema.shape,
      ...FieldSelectionSchema.shape,
      fullTextFilter: z.string().optional()
        .describe("Full-text search across all text fields of the entity"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          offset: params.offset ?? 0,
          limit: params.limit ?? 50,
        };

        if (params.filters) body.filters = params.filters;
        if (params.sortBy) body.sortBy = params.sortBy;
        if (params.sortOrder) body.sortOrder = params.sortOrder;
        if (params.fullTextFilter) body.fullTextFilter = params.fullTextFilter;
        if (params.fields) body.genericFields = params.fields;
        if (params.nestedEntities) body.nestedEntities = params.nestedEntities;
        if (params.nestedDepth !== undefined) body.nestedDepth = params.nestedDepth;
        if (params.excluding) body.excluding = params.excluding;

        const response = await client.post(
          `/generic/all/${params.entityName}`,
          body,
        );

        if (response.status >= 200 && response.status < 300) {
          return successResult(formatPaginatedResponse(response.data));
        }
        return mapResponseToResult(response);
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );

  // ── generic_get ───────────────────────────────────────────────────
  server.tool(
    "generic_get",
    "Get a single entity by its name and ID. Use list_entities to discover entity names.",
    {
      entityName: EntityNameSchema,
      id: EntityIdSchema,
      fields: z.array(z.string()).optional()
        .describe("Specific fields to retrieve. If omitted, all fields are returned."),
      nestedEntities: z.array(z.string()).optional()
        .describe("Related entity names to include"),
      nestedDepth: z.number().int().min(0).max(5).optional()
        .describe("Depth for nested entity loading"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.fields) body.genericFields = params.fields;
        if (params.nestedEntities) body.nestedEntities = params.nestedEntities;
        if (params.nestedDepth !== undefined) body.nestedDepth = params.nestedDepth;

        const response = await client.post(
          `/generic/${params.entityName}/${params.id}`,
          body,
        );
        return mapResponseToResult(response);
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );

  // ── generic_create ────────────────────────────────────────────────
  server.tool(
    "generic_create",
    "Create a new entity. Use describe_entity to learn what fields are required. Pass entity data as a JSON object.",
    {
      entityName: EntityNameSchema,
      data: z.record(z.string(), z.unknown())
        .describe("Entity data as key-value pairs. Use describe_entity to learn available fields."),
    },
    async (params) => {
      try {
        const response = await client.post(
          `/generic/${params.entityName}`,
          params.data,
        );
        return mapResponseToResult(response);
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );

  // ── generic_update ────────────────────────────────────────────────
  server.tool(
    "generic_update",
    "Update an existing entity by its name and ID. Only pass the fields you want to change.",
    {
      entityName: EntityNameSchema,
      id: EntityIdSchema,
      data: z.record(z.string(), z.unknown())
        .describe("Fields to update as key-value pairs. Only include fields you want to change."),
    },
    async (params) => {
      try {
        const response = await client.put(
          `/generic/${params.entityName}/${params.id}`,
          params.data,
        );
        return mapResponseToResult(response);
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );

  // ── generic_delete ────────────────────────────────────────────────
  server.tool(
    "generic_delete",
    "Delete an entity by its name and ID.",
    {
      entityName: EntityNameSchema,
      id: EntityIdSchema,
    },
    async (params) => {
      try {
        const response = await client.delete(
          `/generic/${params.entityName}/${params.id}`,
        );
        return mapResponseToResult(response);
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
