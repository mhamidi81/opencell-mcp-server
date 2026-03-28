import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "./config.js";
import { OpencellClient } from "./http/opencell-client.js";
import { registerAllTools } from "./tools/registry.js";

export function createServer(config: Config): McpServer {
  const server = new McpServer({
    name: "opencell-mcp-server",
    version: "1.0.0",
  });

  const client = new OpencellClient(config);

  registerAllTools(server, client);

  return server;
}
