import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { open } from "@tauri-apps/plugin-shell";
import type { TsfAction } from "./types";

export function getSmartActions(query: string): TsfAction[] {
  const q = query.trim();
  if (!q) return [];

  const actions: TsfAction[] = [];

  for (const matcher of MATCHERS) {
    const result = matcher(q);
    if (result) actions.push(...result);
  }

  return actions;
}

// ── Matchers ────────────────────────────────────────────────────────────────

const MATCHERS: ((q: string) => TsfAction[] | null)[] = [
  matchCalculation,
  matchUuid,
  matchPassword,
  matchTimestamp,
  matchNumberBase,
  matchBase64,
  matchUrlEncode,
  matchColor,
  matchHash,
  matchKillProcess,
  matchLorem,
  matchJsonSample,
  matchQrCode,
  matchIpAddress,
  matchOpenDirectory,
  matchCaseConversion,
  matchWordCount,
  matchRandomNumber,
  matchReverseString,
  matchDataConvert,
];

function prefixOf(input: string, target: string): boolean {
  if (input.length < 2) return false;
  return target.startsWith(input) || input.startsWith(target);
}

function startsWithAny(q: string, prefixes: string[]): boolean {
  return prefixes.some((p) => prefixOf(q, p));
}

function matchesGenPrefix(
  ql: string,
  keywords: string[],
): boolean {
  if (/^gen(erate)?$/i.test(ql)) return true;
  const afterGen = ql.replace(/^gen(?:erate)?\s+/, "");
  if (afterGen === ql) return false;
  return keywords.some((kw) => prefixOf(afterGen, kw));
}

function parseCount(ql: string, max = 10): number {
  const m = ql.match(/\b(\d+)\b/);
  return m ? Math.max(1, Math.min(parseInt(m[1]!), max)) : 1;
}

function makeSmartAction(
  id: string,
  label: string,
  description: string,
  icon: string,
  result: string,
): TsfAction {
  return {
    id,
    type: "smart",
    label,
    description,
    icon,
    keywords: [],
    section: "Instant",
    result,
    execute: async () => {
      await navigator.clipboard.writeText(result);
    },
  };
}

// ── Calculation ─────────────────────────────────────────────────────────────

function safeCalculate(expr: string): number | null {
  try {
    let e = expr.trim();
    if (!e) return null;

    // Replace constants
    e = e.replace(/\bpi\b/gi, `(${Math.PI})`);
    e = e.replace(/\btau\b/gi, `(${Math.PI * 2})`);

    // Math functions
    const fns = [
      "sqrt", "cbrt", "sin", "cos", "tan", "abs", "ceil",
      "floor", "round", "log2", "log10", "exp", "min", "max",
      "pow", "asin", "acos", "atan", "sign", "trunc", "hypot",
    ];
    for (const fn of fns) {
      const re = new RegExp(`\\b${fn}\\s*\\(`, "gi");
      e = e.replace(re, `Math.${fn}(`);
    }
    // log → Math.log, ln → Math.log
    e = e.replace(/\bln\s*\(/gi, "Math.log(");
    e = e.replace(/\blog\s*\(/gi, "Math.log10(");

    // Replace ^ with **
    e = e.replace(/\^/g, "**");
    // Replace × ÷
    e = e.replace(/×/g, "*").replace(/÷/g, "/");

    // Handle percentages: "20% of 500" → (20/100)*500
    e = e.replace(
      /(\d+(?:\.\d+)?)\s*%\s*(?:of\s+)(\d+(?:\.\d+)?)/gi,
      "($1/100)*$2",
    );
    // standalone percentage: "20%" → 0.2
    e = e.replace(/(\d+(?:\.\d+)?)\s*%/g, "($1/100)");

    // Safety: after processing, check for dangerous patterns
    const sanitized = e.replace(/Math\.\w+/g, "");
    if (/[a-zA-Z_$\\]/.test(sanitized)) return null;
    if (/\b(function|return|var|let|const|class|import|export|eval|this|window|document|global|process|require)\b/i.test(e)) return null;

    const result = new Function(`"use strict"; return (${e})`)() as unknown;

    if (typeof result !== "number" || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

function formatNumber(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) {
    return n.toLocaleString("en-US");
  }
  // Check if it's a clean float
  const str = n.toPrecision(15).replace(/0+$/, "").replace(/\.$/, "");
  const num = parseFloat(str);
  if (Math.abs(num) < 1e15 && Math.abs(num) > 1e-10) {
    return num.toLocaleString("en-US", { maximumFractionDigits: 10 });
  }
  return n.toExponential(6);
}

function matchCalculation(q: string): TsfAction[] | null {
  const ql = q.trim();

  // Match "= expression" or "calc expression"
  let expr: string | null = null;

  const eqMatch = ql.match(/^=\s*(.+)/);
  if (eqMatch) expr = eqMatch[1]!;

  const calcMatch = ql.match(/^calc(?:ulate)?\s+(.+)/i);
  if (calcMatch) expr = calcMatch[1]!;

  // Also match bare arithmetic expressions (must contain an operator)
  if (!expr && /^[\d(]/.test(ql) && /[+\-*/^%]/.test(ql) && /\d/.test(ql)) {
    // Ensure it's not just a number
    if (!/^\d+$/.test(ql.replace(/[\s,]/g, ""))) {
      expr = ql;
    }
  }

  if (!expr) return null;

  const result = safeCalculate(expr);
  if (result === null) return null;

  const formatted = formatNumber(result);
  const rawResult = Number.isInteger(result)
    ? result.toString()
    : result.toPrecision(15).replace(/0+$/, "").replace(/\.$/, "");

  return [
    makeSmartAction(
      "smart-calc",
      `= ${formatted}`,
      `${expr.trim()} = ${rawResult}`,
      "Calculator",
      rawResult,
    ),
  ];
}

// ── UUID ────────────────────────────────────────────────────────────────────

function matchUuid(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();

  const direct = startsWithAny(ql, ["uuid", "uid", "guid"]);
  const countForm = /^\d+\s+uuid/i.test(ql);
  const genMatch = matchesGenPrefix(ql, ["uuid", "uid", "guid"]);
  const genCountForm = /^gen(?:erate)?\s+\d+\s+uuid/i.test(ql);

  if (!direct && !countForm && !genMatch && !genCountForm) return null;

  const count = parseCount(ql);
  const uuids = Array.from({ length: count }, () => crypto.randomUUID());
  const result = uuids.join("\n");

  return [
    makeSmartAction(
      "smart-uuid",
      count > 1 ? `Generate ${count} UUIDs` : "Generate UUID",
      count > 1 ? `${uuids[0]} + ${count - 1} more` : uuids[0]!,
      "Fingerprint",
      result,
    ),
  ];
}

// ── Password ────────────────────────────────────────────────────────────────

const PW_CHARSETS = {
  all: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=",
  strong:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
  number: "0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  alphanumeric:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  simple: "abcdefghijklmnopqrstuvwxyz0123456789",
};

type PwType = "strong" | "number" | "alpha" | "alphanumeric" | "simple" | "all";

const PW_MODIFIERS: { prefixes: string[]; type: PwType }[] = [
  { prefixes: ["strong", "secure"], type: "strong" },
  { prefixes: ["number", "numeric", "digit", "pin"], type: "number" },
  { prefixes: ["alpha"], type: "alpha" },
  { prefixes: ["alphanum"], type: "alphanumeric" },
  { prefixes: ["simple", "easy"], type: "simple" },
];

function genPw(length: number, charset: string): string {
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => charset[n % charset.length]).join("");
}

function matchPassword(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();

  const direct =
    startsWithAny(ql, ["pass", "password", "passwd"]) || /^pw\b/i.test(ql);
  const genPassword = matchesGenPrefix(ql, ["pass", "password", "pw"]);
  const allModPrefixes = PW_MODIFIERS.flatMap((m) => m.prefixes);
  const genModifier = matchesGenPrefix(ql, allModPrefixes);
  const modifierAlone = allModPrefixes.some((p) =>
    prefixOf(ql.split(/\s+/)[0] ?? "", p),
  );

  if (!direct && !genPassword && !genModifier && !modifierAlone) return null;

  let pwType: PwType = "all";
  let length = 20;
  let typeLabel = "";

  for (const mod of PW_MODIFIERS) {
    if (
      mod.prefixes.some(
        (p) => ql.includes(p) || ql.split(/\s+/).some((w) => prefixOf(w, p)),
      )
    ) {
      pwType = mod.type;
      if (pwType === "strong") length = 32;
      typeLabel =
        mod.prefixes[0]!.charAt(0).toUpperCase() +
        mod.prefixes[0]!.slice(1) +
        " ";
      break;
    }
  }

  const lenMatch = ql.match(/\b(\d{1,3})\b/);
  if (lenMatch) {
    const n = parseInt(lenMatch[1]!);
    if (n >= 4 && n <= 128) length = n;
  }

  const countMatch = ql.match(/^(?:gen(?:erate)?\s+)?(\d+)\s+/);
  const count =
    countMatch &&
    parseInt(countMatch[1]!) > 0 &&
    parseInt(countMatch[1]!) <= 10
      ? parseInt(countMatch[1]!)
      : 1;

  const charset = PW_CHARSETS[pwType];
  const passwords = Array.from({ length: count }, () =>
    genPw(length, charset),
  );
  const result = passwords.join("\n");

  return [
    makeSmartAction(
      "smart-password",
      count > 1
        ? `Generate ${count} ${typeLabel}passwords`
        : `Generate ${typeLabel}password`,
      count > 1
        ? `${passwords[0]} + ${count - 1} more · ${length} chars`
        : `${passwords[0]} · ${length} chars`,
      "Lock",
      result,
    ),
  ];
}

// ── Timestamp ───────────────────────────────────────────────────────────────

function matchTimestamp(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();

  if (
    startsWithAny(ql, ["now", "timestamp", "unix", "current time"]) &&
    !/\d{8,}/.test(ql)
  ) {
    const now = Math.floor(Date.now() / 1000);
    return [
      {
        id: "smart-timestamp-now",
        type: "smart",
        label: "Current Unix Timestamp",
        description: String(now),
        icon: "Clock",
        keywords: [],
        section: "Instant",
        result: String(now),
        execute: async () => {
          await navigator.clipboard.writeText(
            String(Math.floor(Date.now() / 1000)),
          );
        },
      },
    ];
  }

  const tsMatch = ql.match(/^(?:epoch|unix|timestamp)\s+(\d{8,13})$/);
  const bareMatch = ql.match(/^(\d{10,13})$/);
  const num = tsMatch?.[1] ?? bareMatch?.[1];

  if (num) {
    const ts = parseInt(num);
    const ms = ts > 1e12 ? ts : ts * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;

    const formatted = d.toISOString();
    const local = d.toLocaleString();

    return [
      makeSmartAction(
        "smart-timestamp-convert",
        "Convert Timestamp",
        `${formatted} — ${local}`,
        "Calendar",
        formatted,
      ),
    ];
  }

  return null;
}

// ── Number Base ─────────────────────────────────────────────────────────────

function matchNumberBase(q: string): TsfAction[] | null {
  const m = q.match(
    /^(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|\d+)\s+(?:to\s+)?(hex|dec(?:imal)?|bin(?:ary)?|oct(?:al)?)/i,
  );
  if (!m) return null;

  const input = m[1]!;
  const target = m[2]!.toLowerCase();

  let value: bigint;
  try {
    value = BigInt(input);
  } catch {
    return null;
  }

  let result: string;
  let label: string;

  if (target.startsWith("hex")) {
    result = "0x" + value.toString(16).toUpperCase();
    label = "Hexadecimal";
  } else if (target.startsWith("dec")) {
    result = value.toString(10);
    label = "Decimal";
  } else if (target.startsWith("bin")) {
    result = "0b" + value.toString(2);
    label = "Binary";
  } else if (target.startsWith("oct")) {
    result = "0o" + value.toString(8);
    label = "Octal";
  } else {
    return null;
  }

  return [
    makeSmartAction(
      "smart-number-base",
      `${input} → ${label}`,
      result,
      "Binary",
      result,
    ),
  ];
}

// ── Base64 ──────────────────────────────────────────────────────────────────

function matchBase64(q: string): TsfAction[] | null {
  const decMatch = q.match(/^(?:base64|b64)\s+(?:decode|dec)\s+(.+)/i);
  if (decMatch) {
    try {
      const decoded = decodeURIComponent(
        Array.from(atob(decMatch[1]!.trim()), (c) =>
          "%" + c.charCodeAt(0).toString(16).padStart(2, "0"),
        ).join(""),
      );
      return [
        makeSmartAction(
          "smart-b64-decode",
          "Base64 Decode",
          decoded,
          "FileCode",
          decoded,
        ),
      ];
    } catch {
      return null;
    }
  }

  const encMatch = q.match(/^(?:base64|b64)\s+(?:encode\s+|enc\s+)?(.+)/i);
  if (encMatch) {
    const input = encMatch[1]!.trim();
    if (!input) return null;
    try {
      const encoded = btoa(
        new TextEncoder()
          .encode(input)
          .reduce((s, b) => s + String.fromCharCode(b), ""),
      );
      return [
        makeSmartAction(
          "smart-b64-encode",
          "Base64 Encode",
          encoded,
          "FileCode",
          encoded,
        ),
      ];
    } catch {
      return null;
    }
  }

  return null;
}

// ── URL Encode ──────────────────────────────────────────────────────────────

function matchUrlEncode(q: string): TsfAction[] | null {
  const decMatch = q.match(
    /^(?:url\s*decode|urldecode|decodeuri)\s+(.+)/i,
  );
  if (decMatch) {
    try {
      const decoded = decodeURIComponent(decMatch[1]!.trim());
      return [
        makeSmartAction(
          "smart-url-decode",
          "URL Decode",
          decoded,
          "Link",
          decoded,
        ),
      ];
    } catch {
      return null;
    }
  }

  const encMatch = q.match(
    /^(?:url\s*encode|urlencode|encodeuri)\s+(.+)/i,
  );
  if (encMatch) {
    const encoded = encodeURIComponent(encMatch[1]!.trim());
    return [
      makeSmartAction(
        "smart-url-encode",
        "URL Encode",
        encoded,
        "Link",
        encoded,
      ),
    ];
  }

  return null;
}

// ── Color ───────────────────────────────────────────────────────────────────

function matchColor(q: string): TsfAction[] | null {
  const hexMatch = q.match(
    /^(?:color\s+)?#([0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)$/,
  );
  if (hexMatch) {
    let hex = hexMatch[1]!;
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const result = `rgb(${r}, ${g}, ${b})`;
    return [
      makeSmartAction(
        "smart-color-hex",
        `#${hex.toUpperCase()} → RGB`,
        result,
        "Palette",
        result,
      ),
    ];
  }

  const rgbMatch = q.match(
    /^(?:color\s+)?rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i,
  );
  if (rgbMatch) {
    const [r, g, b] = [
      parseInt(rgbMatch[1]!),
      parseInt(rgbMatch[2]!),
      parseInt(rgbMatch[3]!),
    ];
    const hex =
      "#" +
      [r, g, b]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
    return [
      makeSmartAction(
        "smart-color-rgb",
        `rgb(${r}, ${g}, ${b}) → HEX`,
        hex,
        "Palette",
        hex,
      ),
    ];
  }

  return null;
}

// ── Hash ────────────────────────────────────────────────────────────────────

function matchHash(q: string): TsfAction[] | null {
  const m = q.match(
    /^(sha-?256|sha-?1|sha-?384|sha-?512|hash)\s+(.+)/i,
  );
  if (!m) return null;

  const algo = m[1]!.toLowerCase().replace(/-/g, "");
  const input = m[2]!.trim();
  if (!input) return null;

  const algoMap: Record<string, string> = {
    hash: "SHA-256",
    sha256: "SHA-256",
    sha1: "SHA-1",
    sha384: "SHA-384",
    sha512: "SHA-512",
  };
  const hashAlgo = algoMap[algo] ?? "SHA-256";

  return [
    {
      id: "smart-hash",
      type: "smart",
      label: `${hashAlgo} Hash`,
      description: `Hash of "${input.length > 40 ? input.slice(0, 40) + "..." : input}"`,
      icon: "ShieldCheck",
      keywords: [],
      section: "Instant",
      execute: async () => {
        const data = new TextEncoder().encode(input);
        const buf = await crypto.subtle.digest(hashAlgo, data);
        const hex = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        await navigator.clipboard.writeText(hex);
      },
    },
  ];
}

// ── Kill Process ────────────────────────────────────────────────────────────

function matchKillProcess(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();

  const m = ql.match(/^(kill|close|stop|terminate|end|quit)\s+(.+)/);
  if (!m) return null;

  const target = m[2]!.trim();
  if (/^port\s+\d+$/i.test(target)) return null;
  if (target.length < 2) return null;

  return [
    {
      id: `smart-kill-${target}`,
      type: "smart",
      label: `Kill "${target}"`,
      description: `Terminate all processes matching "${target}"`,
      icon: "Trash2",
      keywords: [],
      section: "Instant",
      execute: async () => {
        const processes = await invoke<
          Array<{ pid: number; name: string }>
        >("list_processes");
        const matching = processes.filter((p) =>
          p.name.toLowerCase().includes(target),
        );
        for (const p of matching) {
          try {
            await invoke("kill_process", { pid: p.pid });
          } catch {
            // protected
          }
        }
      },
    },
  ];
}

// ── Lorem Ipsum ─────────────────────────────────────────────────────────────

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing",
  "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore",
  "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam",
  "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure",
  "in", "reprehenderit", "voluptate", "velit", "esse", "cillum",
  "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat",
  "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const HIPSTER_WORDS = [
  "artisan", "kombucha", "vinyl", "cardigan", "skateboard", "ethical",
  "organic", "craft", "beer", "selvage", "tattooed", "fixie",
  "portland", "brunch", "gastropub", "dreamcatcher", "aesthetic",
  "kickstarter", "vaporware", "normcore", "pitchfork", "flannel",
  "retro", "kale", "chips", "succulents", "hashtag", "tofu",
];

const TECH_WORDS = [
  "algorithm", "API", "backend", "blockchain", "cache", "cloud",
  "compiler", "container", "database", "deploy", "devops", "docker",
  "endpoint", "framework", "frontend", "function", "GraphQL", "HTTP",
  "kubernetes", "lambda", "library", "microservice", "middleware",
  "module", "pipeline", "promise", "proxy", "React", "Redis",
  "refactor", "repository", "REST", "runtime", "schema", "server",
  "serverless", "socket", "SQL", "typescript", "webhook", "websocket",
];

const CORPUS_MAP: Record<string, string[]> = {
  lorem: LOREM_WORDS,
  hipster: HIPSTER_WORDS,
  tech: TECH_WORDS,
};

function randomWords(count: number, words: string[] = LOREM_WORDS): string {
  const arr = new Uint32Array(count);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => words[n % words.length]).join(" ");
}

function loremSentence(words: string[] = LOREM_WORDS): string {
  const w = randomWords(8 + Math.floor(Math.random() * 8), words);
  return w.charAt(0).toUpperCase() + w.slice(1) + ".";
}

function loremParagraph(words: string[] = LOREM_WORDS): string {
  return Array.from(
    { length: 4 + Math.floor(Math.random() * 3) },
    () => loremSentence(words),
  ).join(" ");
}

function matchLorem(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();

  if (!startsWithAny(ql, ["lorem"]) && !matchesGenPrefix(ql, ["lorem"]))
    return null;

  const nums = ql.match(/(\d+)/);
  const count = nums
    ? Math.max(1, Math.min(parseInt(nums[1]!), 10))
    : 1;

  // Detect corpus
  let corpusWords = LOREM_WORDS;
  let corpusLabel = "";
  for (const [key, words] of Object.entries(CORPUS_MAP)) {
    if (ql.includes(key) && key !== "lorem") {
      corpusWords = words;
      corpusLabel = ` (${key})`;
      break;
    }
  }

  let mode = "paragraph";
  if (/word/i.test(ql)) mode = "word";
  else if (/sent/i.test(ql)) mode = "sentence";

  let result: string;
  let desc: string;

  if (mode === "word") {
    result = randomWords(count, corpusWords);
    desc = `${count} words${corpusLabel}`;
  } else if (mode === "sentence") {
    result = Array.from({ length: count }, () => loremSentence(corpusWords)).join(" ");
    desc = `${count} sentence${count > 1 ? "s" : ""}${corpusLabel}`;
  } else {
    result = Array.from({ length: count }, () => loremParagraph(corpusWords)).join("\n\n");
    desc = `${count} paragraph${count > 1 ? "s" : ""}${corpusLabel}`;
  }

  return [
    makeSmartAction(
      "smart-lorem",
      "Lorem Ipsum",
      `${desc} — ${result.slice(0, 50)}...`,
      "TextCursorInput",
      result,
    ),
  ];
}

// ── JSON Sample ─────────────────────────────────────────────────────────────

function matchJsonSample(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();

  const direct = startsWithAny(ql, ["json"]);
  const genJson = matchesGenPrefix(ql, ["json"]);

  if (!direct && !genJson) return null;

  const count = parseCount(ql);

  const samples = Array.from({ length: count }, () => {
    const id = Math.floor(Math.random() * 10000);
    return JSON.stringify(
      {
        id,
        name: `item_${id}`,
        active: Math.random() > 0.3,
        value: Math.round(Math.random() * 100 * 100) / 100,
        created: new Date().toISOString(),
      },
      null,
      2,
    );
  });

  const result =
    count === 1 ? samples[0]! : `[\n${samples.join(",\n")}\n]`;

  return [
    makeSmartAction(
      "smart-json",
      count > 1
        ? `Generate ${count} JSON objects`
        : "Generate JSON",
      result.split("\n")[0]! +
        (result.split("\n").length > 1 ? " ..." : ""),
      "Braces",
      result,
    ),
  ];
}

// ── QR Code ─────────────────────────────────────────────────────────────────

function matchQrCode(q: string): TsfAction[] | null {
  const ql = q.trim();
  const m = ql.match(/^qr\s+(.+)/i);
  if (!m) return null;

  const url = m[1]!.trim();
  if (!url) return null;

  return [
    {
      id: "smart-qr",
      type: "smart",
      label: `Generate QR Code`,
      description: url.length > 50 ? url.slice(0, 50) + "..." : url,
      icon: "QrCode",
      keywords: [],
      section: "Instant",
      execute: async () => {
        // Navigate to QR Code tool with URL pre-filled
        await emit("palette-tool-selected", {
          toolId: "qr-code",
          prefillUrl: url,
        });
        const mainWin = await WebviewWindow.getByLabel("main");
        if (mainWin) {
          await mainWin.show();
          await mainWin.setFocus();
        }
      },
    },
  ];
}

// ── IP Address ──────────────────────────────────────────────────────────────

function matchIpAddress(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();

  const isIp =
    ql === "ip" ||
    ql === "my ip" ||
    ql === "myip" ||
    ql === "ip public" ||
    ql === "public ip" ||
    ql === "ip address" ||
    ql === "what is my ip" ||
    ql === "whatismyip";

  if (!isIp) return null;

  return [
    {
      id: "smart-ip-public",
      type: "smart",
      label: "Public IP Address",
      description: "Fetch & copy your public IP address",
      icon: "Globe",
      keywords: [],
      section: "Instant",
      execute: async () => {
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          const data = (await res.json()) as { ip: string };
          await navigator.clipboard.writeText(data.ip);
        } catch {
          await navigator.clipboard.writeText("Failed to fetch IP");
        }
      },
    },
  ];
}

// ── Open Directory ──────────────────────────────────────────────────────────

function matchOpenDirectory(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();
  const m = ql.match(/^open\s+(.+)/i);
  if (!m) return null;

  const target = m[1]!.trim().toLowerCase();

  // Map common folder names to environment variable paths
  const userProfile =
    typeof window !== "undefined"
      ? "" // Will use %USERPROFILE% in the path
      : "";

  const KNOWN_DIRS: Record<string, { label: string; envPath: string }> = {
    desktop: {
      label: "Desktop",
      envPath: `${userProfile}\\Desktop`,
    },
    downloads: {
      label: "Downloads",
      envPath: `${userProfile}\\Downloads`,
    },
    documents: {
      label: "Documents",
      envPath: `${userProfile}\\Documents`,
    },
    pictures: {
      label: "Pictures",
      envPath: `${userProfile}\\Pictures`,
    },
    music: {
      label: "Music",
      envPath: `${userProfile}\\Music`,
    },
    videos: {
      label: "Videos",
      envPath: `${userProfile}\\Videos`,
    },
    home: {
      label: "Home",
      envPath: userProfile || "~",
    },
    temp: {
      label: "Temp",
      envPath: "",
    },
    appdata: {
      label: "AppData",
      envPath: "",
    },
  };

  // Check if it's a known directory
  const known = KNOWN_DIRS[target];
  if (known) {
    return [
      {
        id: `smart-open-${target}`,
        type: "smart",
        label: `Open ${known.label}`,
        description: `Open ${known.label} folder in file explorer`,
        icon: "FolderOpen",
        keywords: [],
        section: "Instant",
        execute: async () => {
          try {
            // Use Tauri shell open to open the folder
            // On Windows, we use explorer.exe with the folder path
            // Use shell: protocol to open well-known folders
            if (target === "temp") {
              await open("file:///C:/Windows/Temp");
            } else if (target === "appdata") {
              // Will open in explorer
              await open("shell:AppData");
            } else if (target === "home") {
              await open("shell:Profile");
            } else {
              await open(`shell:${known.label}`);
            }
          } catch {
            // Fallback: try opening with standard path
            try {
              await open(`shell:${known.label}`);
            } catch {
              // silent fail
            }
          }
        },
      },
    ];
  }

  // Check if it looks like a file path
  if (
    target.includes("\\") ||
    target.includes("/") ||
    /^[a-z]:/i.test(target)
  ) {
    const displayPath =
      target.length > 50 ? "..." + target.slice(-47) : target;
    return [
      {
        id: "smart-open-path",
        type: "smart",
        label: "Open in Explorer",
        description: displayPath,
        icon: "FolderOpen",
        keywords: [],
        section: "Instant",
        execute: async () => {
          try {
            await open(m[1]!.trim());
          } catch {
            // silent fail
          }
        },
      },
    ];
  }

  return null;
}

// ── Case Conversion ─────────────────────────────────────────────────────────

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
  );
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase());
}

function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

function matchCaseConversion(q: string): TsfAction[] | null {
  const conversions: {
    pattern: RegExp;
    label: string;
    transform: (s: string) => string;
  }[] = [
    {
      pattern: /^(?:upper(?:case)?|to\s*upper)\s+(.+)/i,
      label: "UPPERCASE",
      transform: (s) => s.toUpperCase(),
    },
    {
      pattern: /^(?:lower(?:case)?|to\s*lower)\s+(.+)/i,
      label: "lowercase",
      transform: (s) => s.toLowerCase(),
    },
    {
      pattern: /^(?:title(?:\s*case)?|to\s*title)\s+(.+)/i,
      label: "Title Case",
      transform: toTitleCase,
    },
    {
      pattern: /^(?:camel(?:\s*case)?|to\s*camel)\s+(.+)/i,
      label: "camelCase",
      transform: toCamelCase,
    },
    {
      pattern: /^(?:snake(?:\s*case)?|to\s*snake)\s+(.+)/i,
      label: "snake_case",
      transform: toSnakeCase,
    },
    {
      pattern: /^(?:kebab(?:\s*case)?|to\s*kebab)\s+(.+)/i,
      label: "kebab-case",
      transform: toKebabCase,
    },
    {
      pattern: /^(?:pascal(?:\s*case)?|to\s*pascal)\s+(.+)/i,
      label: "PascalCase",
      transform: toPascalCase,
    },
    {
      pattern: /^(?:constant(?:\s*case)?|to\s*constant|screaming)\s+(.+)/i,
      label: "CONSTANT_CASE",
      transform: toConstantCase,
    },
  ];

  for (const conv of conversions) {
    const m = q.match(conv.pattern);
    if (m) {
      const input = m[1]!.trim();
      const result = conv.transform(input);
      return [
        makeSmartAction(
          "smart-case",
          conv.label,
          result,
          "CaseSensitive",
          result,
        ),
      ];
    }
  }

  return null;
}

// ── Word Count ──────────────────────────────────────────────────────────────

function matchWordCount(q: string): TsfAction[] | null {
  const m = q.match(/^(?:count|wc|wordcount|word\s*count|len|length)\s+(.+)/i);
  if (!m) return null;

  const input = m[1]!.trim();
  if (!input) return null;

  const words = input.split(/\s+/).filter(Boolean).length;
  const chars = input.length;
  const lines = input.split(/\n/).length;

  const result = `${words} words, ${chars} characters, ${lines} lines`;

  return [
    makeSmartAction(
      "smart-wc",
      "Word Count",
      result,
      "Hash",
      result,
    ),
  ];
}

// ── Random Number ───────────────────────────────────────────────────────────

function matchRandomNumber(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();

  // "rand 1 100", "random 50 200", "random number 1 1000"
  const rangeMatch = ql.match(
    /^(?:rand(?:om)?(?:\s+number)?)\s+(\d+)\s+(\d+)/i,
  );
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1]!);
    const max = parseInt(rangeMatch[2]!);
    if (min >= max) return null;
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const val = min + (arr[0]! % (max - min + 1));
    return [
      makeSmartAction(
        "smart-rand",
        `Random: ${val}`,
        `Random number between ${min} and ${max}`,
        "Dice5",
        String(val),
      ),
    ];
  }

  // "rand", "random"
  if (/^rand(om)?(\s+number)?$/i.test(ql)) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const val = arr[0]! % 1000000;
    return [
      makeSmartAction(
        "smart-rand",
        `Random: ${val}`,
        "Random number (0-999999)",
        "Dice5",
        String(val),
      ),
    ];
  }

  // "random color", "rand color"
  if (/^rand(?:om)?\s+color$/i.test(ql)) {
    const arr = new Uint8Array(3);
    crypto.getRandomValues(arr);
    const hex = "#" + Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    return [
      makeSmartAction(
        "smart-rand-color",
        `Random Color: ${hex}`,
        `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`,
        "Palette",
        hex,
      ),
    ];
  }

  return null;
}

// ── Reverse String ──────────────────────────────────────────────────────────

function matchReverseString(q: string): TsfAction[] | null {
  const m = q.match(/^(?:reverse|rev|flip)\s+(.+)/i);
  if (!m) return null;

  const input = m[1]!.trim();
  if (!input) return null;

  const result = [...input].reverse().join("");

  return [
    makeSmartAction(
      "smart-reverse",
      "Reversed",
      result,
      "ArrowLeftRight",
      result,
    ),
  ];
}

// ── Data Conversion (JSON/YAML/TOML) ────────────────────────────────────────

function matchDataConvert(q: string): TsfAction[] | null {
  const ql = q.toLowerCase().trim();

  // Match patterns like "to yaml {json...}", "json to yaml", "yaml to toml"
  const convMatch = ql.match(
    /^(?:to\s+)?(json|yaml|toml)\s+to\s+(json|yaml|toml)$/i,
  );
  if (convMatch) {
    // Navigate to converter tool
    return [
      {
        id: "smart-data-convert",
        type: "smart",
        label: `${convMatch[1]!.toUpperCase()} → ${convMatch[2]!.toUpperCase()}`,
        description: `Open data converter`,
        icon: "ArrowLeftRight",
        keywords: [],
        section: "Instant",
        execute: async () => {
          await emit("palette-tool-selected", { toolId: "data-converter" });
          const mainWin = await WebviewWindow.getByLabel("main");
          if (mainWin) {
            await mainWin.show();
            await mainWin.setFocus();
          }
        },
      },
    ];
  }

  return null;
}
