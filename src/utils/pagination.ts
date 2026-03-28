interface PaginatedData {
  total?: number | null;
  limit?: number;
  offset?: number;
  data?: unknown[];
}

export function formatPaginatedResponse(response: unknown): string {
  const paginated = response as PaginatedData;

  if (!paginated?.data || !Array.isArray(paginated.data)) {
    return JSON.stringify(response, null, 2);
  }

  const total = paginated.total ?? "unknown";
  const offset = paginated.offset ?? 0;
  const limit = paginated.limit ?? paginated.data.length;
  const count = paginated.data.length;
  const end = offset + count;

  const lines: string[] = [];
  lines.push(`Found ${total} total results (showing ${offset + 1} to ${end}):`);
  lines.push("");
  lines.push(JSON.stringify(paginated.data, null, 2));

  if (typeof total === "number" && end < total) {
    lines.push("");
    lines.push(`Pagination: offset=${offset}, limit=${limit}, total=${total}`);
    lines.push(`Use offset=${end} to see more results.`);
  }

  return lines.join("\n");
}
