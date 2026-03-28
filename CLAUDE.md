# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An MCP (Model Context Protocol) server for the Opencell billing system. It exposes Opencell's REST API as MCP tools so that AI assistants can query and manipulate billing entities (invoices, payments, accounts, orders, etc.).

## Commands

- `npm run build` — TypeScript compile to `dist/`
- `npm run dev` — Run locally with tsx (hot-reload)
- `npm start` — Run compiled output
- No test framework is configured

## Required Environment Variables

Set in `.env` or shell. The server will fail to start without these:
- `OPENCELL_BASE_URL`, `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`

Optional: `MCP_TRANSPORT` (stdio|http, default stdio), `MCP_HTTP_PORT`, `OPENCELL_API_VERSION` (default v2), `MCP_DEFAULT_PAGE_SIZE`, `MCP_MAX_PAGE_SIZE`, `MCP_REQUEST_TIMEOUT_MS`, `MCP_LOG_LEVEL`

## Architecture

**Entry point:** `src/index.ts` — supports two transports: stdio (default) and HTTP/SSE.

**Core layers:**
- `src/config.ts` — loads env vars (with built-in .env parser, no dotenv dependency)
- `src/auth/keycloak-client.ts` — OAuth2 client_credentials flow against Keycloak, with token caching and refresh
- `src/http/opencell-client.ts` — HTTP client wrapping `fetch` with Bearer auth, timeout, and automatic 401 retry
- `src/server.ts` — creates `McpServer` instance and wires up all tools via the registry

**Tool registration pattern:** Each tool file exports a `register*Tool(server, client)` function. All are aggregated in `src/tools/registry.ts` via `registerAllTools()`.

**Tool tiers:**
- **Tier 3 (Discovery):** `list_entities`, `describe_entity`, `opencell_version`, `help` — in `src/tools/generic/`
- **Tier 1 (Generic CRUD):** `generic_list`, `generic_get`, `generic_create`, `generic_update`, `generic_delete` — in `src/tools/generic/generic-crud.tool.ts`. These hit Opencell's `/generic/*` REST endpoints and work with any entity name.
- **Tier 2 (Domain actions):** One file per domain in `src/tools/domains/`. Each registers a single tool with an `action` enum parameter that dispatches to the appropriate Opencell REST endpoint via a switch statement.

**Shared schemas:** `src/schemas/common.ts` — Zod schemas for pagination, filtering, field selection, entity name/ID reused across tools.

**Utils:** `src/utils/error-mapper.ts` (HTTP response → MCP tool result), `src/utils/pagination.ts` (format paginated output), `src/utils/response-formatter.ts` (success/error result helpers).

## Adding a New Domain Action Tool

1. Create `src/tools/domains/<name>-actions.tool.ts` following the existing pattern (action enum, switch dispatch)
2. Export a `register<Name>ActionsTool(server, client)` function
3. Import and call it in `src/tools/registry.ts` inside `registerAllTools()`
