# Opencell MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes the [Opencell](https://opencellsoft.com/) billing platform's REST API as AI-consumable tools. It lets AI assistants query, create, update, and perform business operations on any Opencell entity through a standardized tool interface.

## Features

- **Generic CRUD** -- list, get, create, update, and delete any Opencell entity by name, with filtering, pagination, sorting, and field selection
- **Entity discovery** -- list all available entities and inspect their fields, types, and relationships at runtime
- **Domain-specific actions** -- dedicated tools for invoicing, payments, dunning, accounts, orders, CPQ, catalog, mediation, indexation, documents, and reporting
- **Two transports** -- stdio (default, for CLI/desktop integrations) and HTTP/SSE (for networked setups)
- **Keycloak authentication** -- OAuth2 client credentials flow with automatic token caching and refresh

## Prerequisites

- Node.js >= 18
- An Opencell instance with API access (v2)
- A Keycloak client configured with `client_credentials` grant type

## Quick Start

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env   # or create .env manually (see Configuration below)

# Run in development mode
npm run dev

# Or build and run
npm run build
npm start
```

## Configuration

The server is configured via environment variables. They can be set in a `.env` file in the project root.

### Required

| Variable | Description |
|---|---|
| `OPENCELL_BASE_URL` | Base URL of the Opencell instance (e.g. `https://opencell.example.com/api/rest`) |
| `KEYCLOAK_URL` | Keycloak server URL (e.g. `https://auth.example.com`) |
| `KEYCLOAK_REALM` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | OAuth2 client ID |
| `KEYCLOAK_CLIENT_SECRET` | OAuth2 client secret |

### Optional

| Variable | Default | Description |
|---|---|---|
| `OPENCELL_API_VERSION` | `v2` | Opencell API version path segment |
| `MCP_TRANSPORT` | `stdio` | Transport mode: `stdio` or `http` |
| `MCP_HTTP_PORT` | `3000` | HTTP server port (when using `http` transport) |
| `MCP_DEFAULT_PAGE_SIZE` | `50` | Default number of records per page |
| `MCP_MAX_PAGE_SIZE` | `500` | Maximum allowed page size |
| `MCP_REQUEST_TIMEOUT_MS` | `30000` | HTTP request timeout in milliseconds |
| `MCP_LOG_LEVEL` | `info` | Log level: `debug`, `info`, `warn`, `error` |

## MCP Client Configuration

### Claude Desktop / Claude Code (stdio)

Add to your MCP settings:

```json
{
  "mcpServers": {
    "opencell": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/opencell-mcp-server",
      "env": {
        "OPENCELL_BASE_URL": "https://opencell.example.com/api/rest",
        "KEYCLOAK_URL": "https://auth.example.com",
        "KEYCLOAK_REALM": "opencell",
        "KEYCLOAK_CLIENT_ID": "mcp-client",
        "KEYCLOAK_CLIENT_SECRET": "your-secret"
      }
    }
  }
}
```

### HTTP/SSE Transport

```bash
MCP_TRANSPORT=http MCP_HTTP_PORT=3000 npm start
```

Endpoints:
- `GET /sse` -- SSE connection for MCP messages
- `POST /messages?sessionId=<id>` -- send MCP messages
- `GET /health` -- health check

## Available Tools

### Discovery & Utility

| Tool | Description |
|---|---|
| `list_entities` | List all queryable entity names in the system |
| `describe_entity` | Get field names, types, and relationships for an entity |
| `opencell_version` | Get Opencell system version info |
| `help` | Show usage guide |

### Generic CRUD

Work with **any** Opencell entity by name:

| Tool | Description |
|---|---|
| `generic_list` | Search/list with filters, sorting, pagination, field selection |
| `generic_get` | Get a single entity by name and ID |
| `generic_create` | Create a new entity |
| `generic_update` | Update an existing entity (partial update) |
| `generic_delete` | Delete an entity by name and ID |

### Domain Action Tools

| Tool | Description |
|---|---|
| `invoice_actions` | Cancel, validate, reject, rebuild, calculate, get PDF, generate, duplicate, manage lines, adjustments |
| `invoicing_actions` | Billing runs: create exceptional runs, advance status, cancel, close invoice lines |
| `payment_actions` | Pay by card/SEPA, manage rejection codes/actions/groups, retry payments |
| `dunning_actions` | Collection plans: switch policies, pause/resume/stop, manage level/action instances |
| `account_actions` | Transfer subscriptions, move accounts, counter instances, one-shot charges |
| `order_actions` | Find orders by code |
| `cpq_actions` | Quote operations, contract billing rules |
| `catalog_actions` | Price plans, price lists, price list lines, discount plans |
| `mediation_actions` | CDR (Charge Detail Record) management |
| `indexation_actions` | Price index management, batch validation/cancellation |
| `document_actions` | Document file management with versioning |
| `reporting_actions` | Report queries, scheduling, result download, aged receivables export |

## Typical AI Workflow

1. **Discover entities** -- call `list_entities` to see what's available
2. **Inspect schema** -- call `describe_entity` to learn an entity's fields
3. **Query data** -- use `generic_list` with filters or `generic_get` by ID
4. **Mutate data** -- use `generic_create` / `generic_update` / `generic_delete`
5. **Business operations** -- use domain action tools (e.g. validate an invoice, process a payment, run billing)

## Project Structure

```
src/
  index.ts                  # Entry point (stdio + HTTP/SSE transports)
  server.ts                 # McpServer creation and tool wiring
  config.ts                 # Environment variable loading
  auth/
    keycloak-client.ts      # OAuth2 client_credentials with token cache
  http/
    opencell-client.ts      # HTTP client (fetch + Bearer auth + timeout)
  schemas/
    common.ts               # Shared Zod schemas (pagination, filters, etc.)
  tools/
    registry.ts             # Aggregates and registers all tools
    generic/                # Discovery + CRUD tools
    domains/                # Domain-specific action tools
  utils/
    error-mapper.ts         # HTTP response -> MCP tool result
    pagination.ts           # Paginated response formatting
    response-formatter.ts   # Success/error result helpers
```

## Development

```bash
# Type-check and compile
npm run build

# Run with hot-reload (tsx)
npm run dev
```

There is no test framework configured yet. TypeScript strict mode is enabled.

## License

Proprietary
