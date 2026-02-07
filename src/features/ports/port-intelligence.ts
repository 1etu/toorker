export type ServiceCategory = "dev" | "database" | "infra" | "system";

const PORT_DATABASE: Record<
  number,
  { name: string; description: string; category: ServiceCategory }
> = {
  22: { name: "SSH", description: "Secure Shell", category: "infra" },
  53: { name: "DNS", description: "Domain Name System", category: "infra" },
  80: { name: "HTTP", description: "Web server", category: "infra" },
  443: { name: "HTTPS", description: "Secure web server", category: "infra" },
  1433: {
    name: "SQL Server",
    description: "Microsoft SQL Server",
    category: "database",
  },
  1521: {
    name: "Oracle DB",
    description: "Oracle Database",
    category: "database",
  },
  2181: {
    name: "ZooKeeper",
    description: "Apache ZooKeeper",
    category: "infra",
  },
  3000: {
    name: "Dev Server",
    description: "Next.js, React, or Express",
    category: "dev",
  },
  3001: {
    name: "Dev Server",
    description: "Node.js (alternate port)",
    category: "dev",
  },
  3306: {
    name: "MySQL",
    description: "MySQL / MariaDB",
    category: "database",
  },
  4200: {
    name: "Angular",
    description: "Angular dev server",
    category: "dev",
  },
  4500: {
    name: "Dev Server",
    description: "Development server",
    category: "dev",
  },
  5000: {
    name: "Flask / ASP.NET",
    description: "Python or .NET dev server",
    category: "dev",
  },
  5173: { name: "Vite", description: "Vite dev server", category: "dev" },
  5174: {
    name: "Vite",
    description: "Vite dev server (alt)",
    category: "dev",
  },
  5432: {
    name: "PostgreSQL",
    description: "PostgreSQL database",
    category: "database",
  },
  5672: {
    name: "RabbitMQ",
    description: "Message broker",
    category: "infra",
  },
  6379: {
    name: "Redis",
    description: "In-memory data store",
    category: "database",
  },
  6380: {
    name: "Redis",
    description: "Redis (alt port)",
    category: "database",
  },
  8000: {
    name: "Django / FastAPI",
    description: "Python web server",
    category: "dev",
  },
  8080: {
    name: "HTTP Proxy",
    description: "Proxy or Tomcat",
    category: "infra",
  },
  8081: {
    name: "HTTP Alt",
    description: "Alternative HTTP service",
    category: "infra",
  },
  8443: {
    name: "HTTPS Alt",
    description: "Alternative HTTPS",
    category: "infra",
  },
  8888: {
    name: "Jupyter",
    description: "Jupyter Notebook",
    category: "dev",
  },
  9000: {
    name: "PHP-FPM",
    description: "PHP or SonarQube",
    category: "infra",
  },
  9090: {
    name: "Prometheus",
    description: "Monitoring",
    category: "infra",
  },
  9200: {
    name: "Elasticsearch",
    description: "Search engine API",
    category: "database",
  },
  9300: {
    name: "Elasticsearch",
    description: "Transport layer",
    category: "database",
  },
  15672: {
    name: "RabbitMQ UI",
    description: "Management console",
    category: "infra",
  },
  27017: {
    name: "MongoDB",
    description: "MongoDB database",
    category: "database",
  },
};

const PROCESS_HINTS: Record<
  string,
  { label: string; category: ServiceCategory }
> = {
  "node.exe": { label: "Node.js", category: "dev" },
  node: { label: "Node.js", category: "dev" },
  "python.exe": { label: "Python", category: "dev" },
  python: { label: "Python", category: "dev" },
  "python3.exe": { label: "Python", category: "dev" },
  python3: { label: "Python", category: "dev" },
  "java.exe": { label: "Java", category: "dev" },
  java: { label: "Java", category: "dev" },
  "javaw.exe": { label: "Java", category: "dev" },
  "docker.exe": { label: "Docker", category: "infra" },
  "com.docker.backend": { label: "Docker", category: "infra" },
  "postgres.exe": { label: "PostgreSQL", category: "database" },
  postgres: { label: "PostgreSQL", category: "database" },
  "mysqld.exe": { label: "MySQL", category: "database" },
  mysqld: { label: "MySQL", category: "database" },
  "mongod.exe": { label: "MongoDB", category: "database" },
  mongod: { label: "MongoDB", category: "database" },
  "redis-server.exe": { label: "Redis", category: "database" },
  "redis-server": { label: "Redis", category: "database" },
  "nginx.exe": { label: "Nginx", category: "infra" },
  nginx: { label: "Nginx", category: "infra" },
  "httpd.exe": { label: "Apache", category: "infra" },
  httpd: { label: "Apache", category: "infra" },
  "code.exe": { label: "VS Code", category: "dev" },
  "cursor.exe": { label: "Cursor", category: "dev" },
  "dotnet.exe": { label: ".NET", category: "dev" },
  dotnet: { label: ".NET", category: "dev" },
  "ruby.exe": { label: "Ruby", category: "dev" },
  ruby: { label: "Ruby", category: "dev" },
  "go.exe": { label: "Go", category: "dev" },
  "bun.exe": { label: "Bun", category: "dev" },
  bun: { label: "Bun", category: "dev" },
  "deno.exe": { label: "Deno", category: "dev" },
  deno: { label: "Deno", category: "dev" },
};

export interface ServiceInfo {
  name: string;
  description: string;
  category: ServiceCategory;
}

export interface PortLabel {
  name: string;
  description: string;
}

export interface Conflict {
  port: number;
  processName: string;
  reason: string;
}

export function getServiceInfo(
  port: number,
  processName: string,
): ServiceInfo {
  const portInfo = PORT_DATABASE[port];
  const processHint = PROCESS_HINTS[processName.toLowerCase()];

  if (portInfo && processHint) {
    return {
      name: portInfo.name,
      description: `${processHint.label} · ${portInfo.description}`,
      category: portInfo.category,
    };
  }

  if (portInfo) {
    return {
      name: portInfo.name,
      description: portInfo.description,
      category: portInfo.category,
    };
  }

  if (processHint) {
    if (port >= 3000 && port <= 9999) {
      return {
        name: processHint.label,
        description: `Development server on :${port}`,
        category: processHint.category,
      };
    }
    return {
      name: processHint.label,
      description: processName,
      category: processHint.category,
    };
  }

  if (port >= 3000 && port <= 3999) {
    return {
      name: processName.replace(/\.exe$/i, ""),
      description: "Development server",
      category: "dev",
    };
  }
  if (port >= 8000 && port <= 8999) {
    return {
      name: processName.replace(/\.exe$/i, ""),
      description: "HTTP service",
      category: "infra",
    };
  }

  return {
    name: processName.replace(/\.exe$/i, ""),
    description: `Port ${port}`,
    category: "system",
  };
}

export function getPortLabel(port: number): PortLabel | null {
  return PORT_DATABASE[port] ?? null;
}

export function getPortExplanation(
  port: number,
  processName: string,
): string {
  const info = getServiceInfo(port, processName);
  return `${info.name} — ${info.description}`;
}

export function detectConflicts(
  entries: Array<{ port: number; process_name: string }>,
): Conflict[] {
  const conflicts: Conflict[] = [];

  for (const entry of entries) {
    const known = PORT_DATABASE[entry.port];
    if (!known) continue;

    const hint = PROCESS_HINTS[entry.process_name.toLowerCase()];
    if (!hint) continue;

    const expectedLower = known.name.toLowerCase();
    const hintLower = hint.label.toLowerCase();

    if (
      !hintLower.includes(expectedLower) &&
      !expectedLower.includes(hintLower.split(" ")[0] ?? "")
    ) {
      conflicts.push({
        port: entry.port,
        processName: entry.process_name,
        reason: `Port ${entry.port} is typically ${known.name}, but occupied by ${hint.label}`,
      });
    }
  }

  return conflicts;
}
