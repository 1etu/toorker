import { useState, useMemo } from "react";
import { Copy, Check, RefreshCw, Download, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "paragraphs" | "sentences" | "words";

type Corpus = {
  id: string;
  name: string;
  language: string;
  words: string[];
  classicOpening?: string;
};

const CORPORA: Corpus[] = [
  {
    id: "lorem",
    name: "Lorem Ipsum (Marcus Tullius Cicero)",
    language: "Latin",
    classicOpening:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    words: [
      "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing",
      "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore",
      "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam",
      "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
      "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure",
      "in", "reprehenderit", "voluptate", "velit", "esse", "cillum",
      "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat",
      "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
      "deserunt", "mollit", "anim", "id", "est", "laborum", "ac", "ante",
      "bibendum", "blandit", "congue", "cras", "cursus", "diam",
      "dictum", "dignissim", "donec", "dui", "efficitur", "elementum",
      "eros", "euismod", "facilisis", "faucibus", "felis", "fermentum",
      "finibus", "gravida", "habitant", "hendrerit", "iaculis", "imperdiet",
      "integer", "interdum", "justo", "lacinia", "lacus", "laoreet",
      "lectus", "leo", "libero", "ligula", "lobortis", "luctus", "maecenas",
      "massa", "mattis", "mauris", "maximus", "metus", "morbi", "nam",
      "nec", "neque", "nibh", "nisl", "nullam", "nunc", "odio", "orci",
      "ornare", "pellentesque", "pharetra", "placerat", "porta",
      "porttitor", "posuere", "praesent", "pretium", "proin", "pulvinar",
      "purus", "quam", "risus", "rutrum", "sagittis", "sapien",
      "scelerisque", "semper", "sodales", "sollicitudin", "suscipit",
      "suspendisse", "tellus", "tempus", "tincidunt", "tortor", "tristique",
      "turpis", "ultricies", "urna", "varius", "vel", "vestibulum", "vitae",
      "vivamus", "viverra", "volutpat", "vulputate",
    ],
  },
  {
    id: "hipster",
    name: "Hipster Ipsum",
    language: "English",
    words: [
      "artisan", "kombucha", "lumberjack", "vinyl", "cardigan", "skateboard",
      "ethical", "organic", "craft", "beer", "selvage", "taxidermy",
      "tattooed", "thundercats", "fanny", "pack", "wayfarers", "bushwick",
      "vexillologist", "fixie", "enamel", "pin", "portland", "pork",
      "belly", "jianbing", "literally", "synth", "chia", "messenger",
      "bag", "flexitarian", "williamsburg", "tumblr", "pinterest",
      "microdosing", "scenester", "gochujang", "poke", "brunch",
      "gastropub", "dreamcatcher", "edison", "bulb", "shoreditch",
      "man", "braid", "bitters", "chartreuse", "aesthetic", "disrupt",
      "kickstarter", "truffaut", "vaporware", "squid", "franzen",
      "heirloom", "activated", "charcoal", "tacos", "knausgaard",
      "raclette", "tote", "normcore", "pitchfork", "coloring", "book",
      "banh", "mi", "celiac", "echo", "park", "crucifix", "semiotics",
      "copper", "mug", "roof", "party", "succulents", "air", "plant",
      "shabby", "chic", "keffiyeh", "deep", "direct", "trade",
      "hashtag", "neutra", "tofu", "slow", "carb", "retro",
      "flannel", "plaid", "cold", "pressed", "kale", "chips",
    ],
  },
  {
    id: "tech",
    name: "Tech Ipsum",
    language: "English",
    words: [
      "algorithm", "API", "backend", "bandwidth", "blockchain", "boolean",
      "cache", "callback", "cloud", "compiler", "container", "CRUD",
      "database", "debug", "deploy", "devops", "docker", "endpoint",
      "encryption", "framework", "frontend", "function", "git", "GraphQL",
      "hash", "HTTP", "infrastructure", "instance", "interface", "iterator",
      "JSON", "kubernetes", "lambda", "latency", "library", "localhost",
      "merge", "microservice", "middleware", "module", "monorepo", "mutex",
      "namespace", "node", "NPM", "ORM", "package", "parser", "payload",
      "pipeline", "plugin", "pod", "polling", "promise", "protocol",
      "proxy", "query", "queue", "React", "recursion", "Redis",
      "refactor", "regex", "repository", "REST", "runtime", "schema",
      "SDK", "server", "serverless", "sharding", "singleton", "socket",
      "sprint", "SQL", "stack", "state", "stream", "subprocess",
      "terraform", "thread", "token", "transpiler", "typescript",
      "upstream", "variable", "webhook", "websocket", "worker", "YAML",
    ],
  },
  {
    id: "space",
    name: "Space Ipsum",
    language: "English",
    words: [
      "asteroid", "astronaut", "atmosphere", "aurora", "blackhole", "comet",
      "constellation", "cosmos", "crater", "dark", "matter", "dwarf",
      "planet", "eclipse", "exoplanet", "galaxy", "gamma", "ray",
      "gravity", "helium", "horizon", "hubble", "hydrogen", "interstellar",
      "jupiter", "kepler", "launchpad", "light", "year", "lunar",
      "magnetosphere", "mars", "mercury", "meteor", "milky", "way",
      "mission", "moon", "nebula", "neptune", "neutron", "star",
      "nova", "orbit", "oxygen", "parallax", "photon", "plasma",
      "pluto", "pulsar", "quasar", "radiation", "red", "giant",
      "rocket", "rover", "satellite", "saturn", "shuttle", "solar",
      "system", "spacecraft", "spectrum", "supernova", "telescope",
      "universe", "uranus", "vacuum", "venus", "void", "warp",
      "zero", "zenith", "zodiac", "apogee", "perigee", "perihelion",
      "aphelion", "celestial", "cosmic", "galactic", "orbital",
      "planetary", "stellar", "terrestrial", "trajectory", "velocity",
    ],
  },
  {
    id: "pirate",
    name: "Pirate Ipsum",
    language: "English",
    words: [
      "ahoy", "anchor", "avast", "barrel", "bilge", "blackbeard", "blimey",
      "boatswain", "bounty", "bow", "brig", "brigantine", "broadside",
      "buccaneer", "cannon", "captain", "cargo", "chart", "chest",
      "clipper", "compass", "corsair", "crew", "crow", "nest",
      "cutlass", "davy", "jones", "deck", "doubloon", "figurehead",
      "flag", "fleet", "frigate", "galleon", "gangplank", "grog",
      "harbor", "helm", "horizon", "hull", "island", "jolly",
      "roger", "keel", "keelhaul", "knot", "landlubber", "loot",
      "mast", "matey", "mutiny", "navigation", "ocean", "parley",
      "parrot", "peg", "leg", "pillage", "pirate", "plank",
      "plunder", "port", "privateer", "quartermaster", "rigging",
      "rum", "sail", "scallywag", "schooner", "scurvy", "sea",
      "shanty", "shipwreck", "sloop", "smuggler", "starboard",
      "stern", "swashbuckler", "sword", "telescope", "tide",
      "treasure", "vessel", "voyage", "whirlpool", "wind", "yo",
    ],
  },
];

function pickRandom(arr: string[], count: number, seed: number): string[] {
  const result: string[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    result.push(arr[s % arr.length]!);
  }
  return result;
}

function generateSentence(words: string[], seed: number): string {
  const len = 8 + (seed % 12);
  const picked = pickRandom(words, len, seed);
  picked[0] = picked[0]!.charAt(0).toUpperCase() + picked[0]!.slice(1);
  return picked.join(" ") + ".";
}

function generateParagraph(words: string[], seed: number): string {
  const count = 4 + (seed % 4);
  return Array.from({ length: count }, (_, i) =>
    generateSentence(words, seed * 31 + i * 97),
  ).join(" ");
}

export const LoremIpsum = () => {
  const [corpusId, setCorpusId] = useState("lorem");
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [startWithClassic, setStartWithClassic] = useState(true);

  const corpus = CORPORA.find((c) => c.id === corpusId) ?? CORPORA[0]!;

  const output = useMemo(() => {
    const words = corpus.words;

    if (mode === "words") {
      return pickRandom(words, count, seed).join(" ");
    }
    if (mode === "sentences") {
      const sentences = Array.from({ length: count }, (_, i) =>
        generateSentence(words, seed + i * 137),
      );
      if (startWithClassic && corpus.classicOpening && count > 0) {
        sentences[0] = corpus.classicOpening;
      }
      return sentences.join(" ");
    }

    const paragraphs = Array.from({ length: count }, (_, i) =>
      generateParagraph(words, seed + i * 251),
    );
    if (startWithClassic && corpus.classicOpening && count > 0) {
      paragraphs[0] =
        corpus.classicOpening +
        " " +
        generateParagraph(words, seed + 999).split(". ").slice(1).join(". ");
    }
    return paragraphs.join("\n\n");
  }, [corpus, mode, count, seed, startWithClassic]);

  const lines = useMemo(() => output.split("\n"), [output]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lorem-ipsum-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxCount = mode === "words" ? 500 : mode === "sentences" ? 50 : 20;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 shrink-0">
          Text corpus
        </span>
        <select
          value={corpusId}
          onChange={(e) => setCorpusId(e.target.value)}
          className="h-8 flex-1 max-w-sm rounded-md border bg-card px-2 text-[12px] outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          {CORPORA.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}, {c.language}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground/60">Type</span>
          <div className="flex items-center rounded-md border bg-card p-0.5">
            {(["words", "sentences", "paragraphs"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setCount(
                    m === "words" ? Math.min(count, 500) :
                    m === "sentences" ? Math.min(count, 50) :
                    Math.min(count, 20),
                  );
                }}
                className={cn(
                  "rounded-[3px] px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                  mode === m
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground/60">Length</span>
          <input
            type="number"
            min={1}
            max={maxCount}
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(maxCount, parseInt(e.target.value) || 1)))
            }
            className="h-8 w-16 rounded-md border bg-card px-2 text-center font-mono text-[13px] outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {corpus.classicOpening && mode !== "words" && (
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={startWithClassic}
              onChange={(e) => setStartWithClassic(e.target.checked)}
              className="rounded"
            />
            Start with classic
          </label>
        )}

        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
            className="rounded"
          />
          <Hash className="h-3 w-3" />
          Line numbers
        </label>

        <div className="flex-1" />

        <button
          onClick={() => setSeed(Date.now())}
          className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>

        <button
          onClick={handleDownload}
          className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Download className="h-3 w-3" />
          Save
        </button>

        <button
          onClick={copy}
          className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3 w-3 text-success" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          Copy
        </button>
      </div>

      {/* Output */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
          {showLineNumbers ? (
            <div className="flex">
              {/* Line numbers gutter */}
              <div className="shrink-0 select-none border-r bg-muted/20 py-4 pr-3 pl-3 text-right">
                {lines.map((_, i) => (
                  <div
                    key={i}
                    className="font-mono text-[12px] leading-relaxed text-muted-foreground/30"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 p-4 text-[13px] leading-relaxed text-foreground/80">
                {lines.map((line, i) => (
                  <div key={i} className="min-h-[1.625rem]">
                    {line || "\u00A0"}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-[13px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {output}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground/40 tabular-nums">
        <span>{output.split(/\s+/).filter(Boolean).length} words</span>
        <span>{output.length} characters</span>
        <span>{lines.length} lines</span>
        <span>
          {mode === "paragraphs"
            ? `${count} paragraph${count > 1 ? "s" : ""}`
            : mode === "sentences"
              ? `${count} sentence${count > 1 ? "s" : ""}`
              : `${count} word${count > 1 ? "s" : ""}`}
        </span>
      </div>
    </div>
  );
};
