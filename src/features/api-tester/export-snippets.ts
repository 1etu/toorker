interface RequestData {
  method: string;
  url: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
}

export function toCurl({ method, url, headers, body }: RequestData): string {
  const parts = ["curl"];

  if (method !== "GET") {
    parts.push(`-X ${method}`);
  }

  parts.push(`'${url}'`);

  for (const { key, value } of headers) {
    if (key.trim()) {
      parts.push(`-H '${key}: ${value}'`);
    }
  }

  if (body.trim() && ["POST", "PUT", "PATCH"].includes(method)) {
    parts.push(`-d '${body}'`);
  }

  return parts.join(" \\\n  ");
}

export function toFetch({ method, url, headers, body }: RequestData): string {
  const options: string[] = [];

  if (method !== "GET") {
    options.push(`  method: "${method}",`);
  }

  const headerEntries = headers.filter((h) => h.key.trim());
  if (headerEntries.length > 0) {
    const headerLines = headerEntries
      .map((h) => `    "${h.key}": "${h.value}"`)
      .join(",\n");
    options.push(`  headers: {\n${headerLines}\n  },`);
  }

  if (body.trim() && ["POST", "PUT", "PATCH"].includes(method)) {
    options.push(`  body: JSON.stringify(${body}),`);
  }

  if (options.length === 0) {
    return `const response = await fetch("${url}");
const data = await response.json();`;
  }

  return `const response = await fetch("${url}", {
${options.join("\n")}
});
const data = await response.json();`;
}

export function toAxios({ method, url, headers, body }: RequestData): string {
  const headerEntries = headers.filter((h) => h.key.trim());
  const hasHeaders = headerEntries.length > 0;
  const hasBody = body.trim() && ["POST", "PUT", "PATCH"].includes(method);

  const configParts: string[] = [];

  if (hasHeaders) {
    const headerLines = headerEntries
      .map((h) => `    "${h.key}": "${h.value}"`)
      .join(",\n");
    configParts.push(`  headers: {\n${headerLines}\n  }`);
  }

  const methodLower = method.toLowerCase();

  if (hasBody) {
    if (configParts.length > 0) {
      return `const { data } = await axios.${methodLower}("${url}", ${body}, {
${configParts.join(",\n")}
});`;
    }
    return `const { data } = await axios.${methodLower}("${url}", ${body});`;
  }

  if (configParts.length > 0) {
    return `const { data } = await axios.${methodLower}("${url}", {
${configParts.join(",\n")}
});`;
  }

  return `const { data } = await axios.${methodLower}("${url}");`;
}
