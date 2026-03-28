#!/usr/bin/env node

// Allow self-signed certificates in dev environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED ?? "0";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer as createHttpServer } from "node:http";
import { loadConfig } from "./config.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const server = createServer(config);

  if (config.mcpTransport === "http") {
    await startHttpTransport(server, config.mcpHttpPort);
  } else {
    await startStdioTransport(server);
  }
}

async function startStdioTransport(server: ReturnType<typeof createServer>): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Opencell MCP Server running on stdio");
}

async function startHttpTransport(
  server: ReturnType<typeof createServer>,
  port: number,
): Promise<void> {
  const transports = new Map<string, SSEServerTransport>();

  const httpServer = createHttpServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (url.pathname === "/sse" && req.method === "GET") {
      const transport = new SSEServerTransport("/messages", res);
      const sessionId = transport.sessionId;
      transports.set(sessionId, transport);

      res.on("close", () => {
        transports.delete(sessionId);
      });

      await server.connect(transport);
      return;
    }

    if (url.pathname === "/messages" && req.method === "POST") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId || !transports.has(sessionId)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid or missing sessionId");
        return;
      }

      const transport = transports.get(sessionId)!;
      await transport.handlePostMessage(req, res);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });

  httpServer.listen(port, () => {
    console.error(`Opencell MCP Server running on http://localhost:${port}`);
    console.error(`SSE endpoint: http://localhost:${port}/sse`);
    console.error(`Health check: http://localhost:${port}/health`);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
