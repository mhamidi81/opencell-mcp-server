import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "listPricePlans", "getPricePlan", "createPricePlan", "updatePricePlan", "deletePricePlan",
    "listPriceLists", "createPriceList", "deletePriceList",
    "listPriceListLines", "createPriceListLine", "updatePriceListLine", "deletePriceListLine",
    "listDiscountPlans", "createDiscountPlan", "updateDiscountPlan", "deleteDiscountPlan",
  ]).describe("The catalog action to perform"),
  id: z.number().int().positive().optional()
    .describe("Resource ID (for get/update/delete)"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
};

export function registerCatalogActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "catalog_actions",
    "Catalog management: manage price plans, price lists, price list lines, and discount plans.",
    inputSchema,
    async (params) => {
      try {
        const { action, id, data } = params;

        switch (action) {
          // Price Plans
          case "listPricePlans":
            return mapResponseToResult(await client.post(`/catalog/priceManagement`, data));
          case "getPricePlan":
            return mapResponseToResult(await client.get(`/catalog/priceManagement/${id}`));
          case "createPricePlan":
            return mapResponseToResult(await client.post(`/catalog/priceManagement`, data));
          case "updatePricePlan":
            return mapResponseToResult(await client.put(`/catalog/priceManagement/${id}`, data));
          case "deletePricePlan":
            return mapResponseToResult(await client.delete(`/catalog/priceManagement/${id}`));
          // Price Lists
          case "listPriceLists":
            return mapResponseToResult(await client.get(`/catalog/priceList`));
          case "createPriceList":
            return mapResponseToResult(await client.post(`/catalog/priceList`, data));
          case "deletePriceList":
            return mapResponseToResult(await client.delete(`/catalog/priceList/${id}`));
          // Price List Lines
          case "listPriceListLines":
            return mapResponseToResult(await client.get(`/catalog/priceListLine`));
          case "createPriceListLine":
            return mapResponseToResult(await client.post(`/catalog/priceListLine`, data));
          case "updatePriceListLine":
            return mapResponseToResult(await client.put(`/catalog/priceListLine/${id}`, data));
          case "deletePriceListLine":
            return mapResponseToResult(await client.delete(`/catalog/priceListLine/${id}`));
          // Discount Plans
          case "listDiscountPlans":
            return mapResponseToResult(await client.get(`/catalog/discountPlans`));
          case "createDiscountPlan":
            return mapResponseToResult(await client.post(`/catalog/discountPlans`, data));
          case "updateDiscountPlan":
            return mapResponseToResult(await client.put(`/catalog/discountPlans/${id}`, data));
          case "deleteDiscountPlan":
            return mapResponseToResult(await client.delete(`/catalog/discountPlans/${id}`));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
