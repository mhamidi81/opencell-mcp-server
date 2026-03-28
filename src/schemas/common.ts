import { z } from "zod";

export const PaginationSchema = z.object({
  offset: z.number().int().min(0).default(0)
    .describe("Starting row offset for pagination"),
  limit: z.number().int().min(1).max(500).default(50)
    .describe("Maximum number of records to return"),
  sortBy: z.string().optional()
    .describe("Field name to sort results by"),
  sortOrder: z.enum(["ASCENDING", "DESCENDING"]).optional()
    .describe("Sort direction: ASCENDING or DESCENDING"),
});

export const FilterSchema = z.record(z.string(), z.unknown()).optional()
  .describe("Field-specific filters as key-value pairs. Example: {\"status\": \"ACTIVE\", \"code\": \"INV-001\"}");

export const FieldSelectionSchema = z.object({
  fields: z.array(z.string()).optional()
    .describe("Specific field names to retrieve. If omitted, all fields are returned."),
  nestedEntities: z.array(z.string()).optional()
    .describe("Related entity names to include in response"),
  nestedDepth: z.number().int().min(0).max(5).optional()
    .describe("Depth level for loading nested entities (0-5)"),
  excluding: z.array(z.string()).optional()
    .describe("Field names to exclude from response"),
});

export const EntityNameSchema = z.string()
  .min(1)
  .describe("Entity name (e.g., 'Invoice', 'Customer', 'BillingAccount'). Case-insensitive. Use list_entities tool to discover available entities.");

export const EntityIdSchema = z.number().int().positive()
  .describe("Database primary key ID of the entity");
