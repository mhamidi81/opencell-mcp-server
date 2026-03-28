import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OpencellClient } from "../../http/opencell-client.js";
import { mapResponseToResult, mapErrorToResult } from "../../utils/error-mapper.js";

export function registerVersionTool(server: McpServer, client: OpencellClient): void {
  server.tool(
    "opencell_version",
    "Get the Opencell system version information.",
    {},
    async () => {
      try {
        const response = await client.get("/version");
        return mapResponseToResult(response);
      } catch (error) {
        return mapErrorToResult(error);
      }
    },
  );
}
