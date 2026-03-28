import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

const inputSchema = {
  action: z.enum([
    "switch", "massSwitch", "checkMassSwitch", "availablePolicies",
    "pause", "massPause", "stop", "massStop", "resume",
    "addLevelInstance", "removeLevelInstance", "updateLevelInstance",
    "addActionInstance", "removeActionInstance", "updateActionInstance",
    "executeActionInstance", "sendEmail",
  ]).describe("The dunning/collection action to perform"),
  id: z.number().int().positive().optional()
    .describe("Collection plan ID or level/action instance ID"),
  data: z.record(z.string(), z.unknown()).optional()
    .describe("Action-specific data payload"),
};

export function registerDunningActionsTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "dunning_actions",
    "Manage dunning collection plans: switch policies, pause/resume/stop plans, manage level and action instances, send dunning emails.",
    inputSchema,
    async (params) => {
      try {
        const { action, id, data } = params;
        const basePath = "/dunning/collectionPlan";

        switch (action) {
          case "switch":
            return mapResponseToResult(await client.post(`${basePath}/switch/${id}`, data));
          case "massSwitch":
            return mapResponseToResult(await client.post(`${basePath}/massSwitch`, data));
          case "checkMassSwitch":
            return mapResponseToResult(await client.post(`${basePath}/checkMassSwitch`, data));
          case "availablePolicies":
            return mapResponseToResult(await client.post(`${basePath}/availableDunningPolicies`, data));
          case "pause":
            return mapResponseToResult(await client.post(`${basePath}/pause/${id}`, data));
          case "massPause":
            return mapResponseToResult(await client.post(`${basePath}/massPause`, data));
          case "stop":
            return mapResponseToResult(await client.post(`${basePath}/stop/${id}`, data));
          case "massStop":
            return mapResponseToResult(await client.post(`${basePath}/massStop`, data));
          case "resume":
            return mapResponseToResult(await client.post(`${basePath}/resume/${id}`));
          case "addLevelInstance":
            return mapResponseToResult(await client.post(`${basePath}/addDunningLevelInstance`, data));
          case "removeLevelInstance":
            return mapResponseToResult(await client.post(`${basePath}/removeDunningLevelInstance`, data));
          case "updateLevelInstance":
            return mapResponseToResult(await client.put(`${basePath}/updateDunningLevelInstance/${id}`, data));
          case "addActionInstance":
            return mapResponseToResult(await client.post(`${basePath}/addDunningActionInstance`, data));
          case "removeActionInstance":
            return mapResponseToResult(await client.post(`${basePath}/removeDunningActionInstance`, data));
          case "updateActionInstance":
            return mapResponseToResult(await client.put(`${basePath}/updateDunningActionInstance/${id}`, data));
          case "executeActionInstance":
            return mapResponseToResult(await client.post(`${basePath}/executeDunningActionInstance/${id}`));
          case "sendEmail":
            return mapResponseToResult(await client.post(`${basePath}/executeDunningActionInstance/sendByEmail`, data));
          default:
            return { content: [{ type: "text" as const, text: `Unknown action: ${action}` }], isError: true };
        }
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
