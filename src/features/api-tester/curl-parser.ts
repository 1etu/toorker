export interface ParsedRequest {
  method: string;
  url: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
}

export function parseCurl(input: string): ParsedRequest | null {
  const trimmed = input.trim();

  if (!trimmed.toLowerCase().startsWith("curl")) {
    return null;
  }

  let method = "GET";
  let url = "";
  const headers: Array<{ key: string; value: string }> = [];
  let body = "";

  const tokens = tokenize(trimmed);

  let i = 1;
  while (i < tokens.length) {
    const token = tokens[i]!;

    if (token === "-X" || token === "--request") {
      method = (tokens[++i] ?? "GET").toUpperCase();
    } else if (token === "-H" || token === "--header") {
      const headerStr = tokens[++i] ?? "";
      const colonIdx = headerStr.indexOf(":");
      if (colonIdx > 0) {
        headers.push({
          key: headerStr.slice(0, colonIdx).trim(),
          value: headerStr.slice(colonIdx + 1).trim(),
        });
      }
    } else if (
      token === "-d" ||
      token === "--data" ||
      token === "--data-raw" ||
      token === "--data-binary"
    ) {
      body = tokens[++i] ?? "";
      if (method === "GET") method = "POST";
    } else if (token === "--url") {
      url = tokens[++i] ?? "";
    } else if (!token.startsWith("-") && !url) {
      url = token;
    }

    i++;
  }

  if (!url) return null;

  return { method, url, headers, body };
}

function tokenize(input: string): string[] {
  const normalized = input.replace(/\\\n/g, " ").replace(/\\\r\n/g, " ");

  const tokens: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i]!;

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (ch === " " && !inSingle && !inDouble) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current) tokens.push(current);
  return tokens;
}
