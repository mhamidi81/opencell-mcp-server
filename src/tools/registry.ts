import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../http/opencell-client.js";

// Generic tools
import { registerListEntitiesTool } from "./generic/list-entities.tool.js";
import { registerDescribeEntityTool } from "./generic/describe-entity.tool.js";
import { registerGenericCrudTools } from "./generic/generic-crud.tool.js";
import { registerVersionTool } from "./generic/version.tool.js";
import { registerHelpTool } from "./generic/help.tool.js";

// Domain action tools
import { registerInvoiceActionsTool } from "./domains/invoice-actions.tool.js";
import { registerInvoicingActionsTool } from "./domains/invoicing-actions.tool.js";
import { registerPaymentActionsTool } from "./domains/payment-actions.tool.js";
import { registerDunningActionsTool } from "./domains/dunning-actions.tool.js";
import { registerAccountActionsTool } from "./domains/account-actions.tool.js";
import { registerOrderActionsTool } from "./domains/order-actions.tool.js";
import { registerCpqActionsTool } from "./domains/cpq-actions.tool.js";
import { registerCatalogActionsTool } from "./domains/catalog-actions.tool.js";
import { registerMediationActionsTool } from "./domains/mediation-actions.tool.js";
import { registerIndexationActionsTool } from "./domains/indexation-actions.tool.js";
import { registerDocumentActionsTool } from "./domains/document-actions.tool.js";
import { registerReportingActionsTool } from "./domains/reporting-actions.tool.js";

export function registerAllTools(server: McpServer, client: OpencellClient): void {
  // Tier 3: Discovery & utility
  registerListEntitiesTool(server, client);
  registerDescribeEntityTool(server, client);
  registerVersionTool(server, client);
  registerHelpTool(server);

  // Tier 1: Generic CRUD
  registerGenericCrudTools(server, client);

  // Tier 2: Domain actions
  registerInvoiceActionsTool(server, client);
  registerInvoicingActionsTool(server, client);
  registerPaymentActionsTool(server, client);
  registerDunningActionsTool(server, client);
  registerAccountActionsTool(server, client);
  registerOrderActionsTool(server, client);
  registerCpqActionsTool(server, client);
  registerCatalogActionsTool(server, client);
  registerMediationActionsTool(server, client);
  registerIndexationActionsTool(server, client);
  registerDocumentActionsTool(server, client);
  registerReportingActionsTool(server, client);
}
