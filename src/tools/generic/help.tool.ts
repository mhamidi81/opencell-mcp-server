import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { successResult } from "../../utils/response-formatter.js";

const HELP_TEXT = `
# Opencell MCP Server - Available Tools

## Discovery Tools
- **list_entities** - List all queryable entity names in the system
- **describe_entity** - Get field names, types, and relationships for an entity
- **opencell_version** - Get system version information
- **help** - Show this help message

## Generic CRUD Tools (work with any entity)
- **generic_list** - List/search any entity with filtering, sorting, pagination
- **generic_get** - Get a single entity by name and ID
- **generic_create** - Create a new entity
- **generic_update** - Update an existing entity
- **generic_delete** - Delete an entity by name and ID

## Domain Action Tools (business-specific operations)
- **invoice_actions** - Invoice operations: cancel, validate, reject, rebuild, getPdf, etc.
- **invoicing_actions** - Billing run operations: run billing, validate billing run
- **payment_actions** - Payment processing: payByCard, payBySepa, retryPayment
- **dunning_actions** - Dunning/collections: switch, pause, resume, stop plans
- **account_actions** - Account management: transfer subscriptions, move accounts
- **order_actions** - Order operations: duplicate, validate orders
- **cpq_actions** - CPQ operations: quote negotiation, contract management
- **catalog_actions** - Catalog operations: price management, product workflows
- **mediation_actions** - Mediation: submit CDRs
- **indexation_actions** - Price indexation: batch operations
- **document_actions** - Document management: signature requests, file upload
- **reporting_actions** - Reporting: trial balance, report generation

## Typical Workflow
1. Use **list_entities** to discover available entity names
2. Use **describe_entity** to learn an entity's fields and relationships
3. Use **generic_list** / **generic_get** to query data
4. Use **generic_create** / **generic_update** / **generic_delete** for CRUD
5. Use domain action tools for business operations (e.g., cancel an invoice, process a payment)
`.trim();

export function registerHelpTool(server: McpServer): void {
  server.tool(
    "help",
    "Show available tools and usage guide for the Opencell MCP Server.",
    {},
    async () => {
      return successResult(HELP_TEXT);
    },
  );
}
