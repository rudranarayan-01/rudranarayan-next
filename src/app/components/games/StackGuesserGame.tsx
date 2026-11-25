/* eslint-disable no-undef */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiHeart, FiPlay, FiRotateCcw, FiX } from "react-icons/fi";
import Leaderboard from "./Leaderboard";

/* ───────────────────────────── Types ───────────────────────────── */

interface StackGuesserGameProps {
  gameId?: string;
  compact?: boolean;
}

type Group =
  | "language"
  | "frontend"
  | "backend"
  | "mobile"
  | "ai"
  | "database"
  | "devops"
  | "cloud"
  | "tool";

interface TechItem {
  id: string;
  name: string;
  category: string;
  group: Group;
  slug: string;
  color: string;
  /** Logo is dark on transparent — invert it so it shows on the dark UI. */
  invert: boolean;
}

type ArtStyle = "normal" | "grayscale" | "silhouette" | "blurred";
type GameState = "idle" | "playing" | "gameover";
type ModeId = "all" | "code" | "infra";
type Outcome = "cleared" | "eliminated";

interface Level {
  id: string;
  name: string;
  fromQuestion: number;
  seconds: number;
  multiplier: number;
  art: ArtStyle;
  artLabel: string;
  /** Distractors come from the same group as the answer. */
  confusable: boolean;
  showCategoryHint: boolean;
  badge: string;
}

interface LogoQuestion {
  index: number;
  level: Level;
  target: TechItem;
  options: TechItem[];
}

interface ChoiceFeedback {
  selectedId: string | null;
  correctId: string;
  isCorrect: boolean;
  timedOut: boolean;
  pointsEarned: number;
}

/* ───────────────────────────── Constants ───────────────────────────── */

const TOTAL_QUESTIONS = 20;
const STARTING_LIVES = 3;
const SURVIVAL_BONUS = 25;
const NAME_STORAGE_KEY = "portfolio_game_player_name";
const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const LEVELS: Level[] = [
  {
    id: "warmup",
    name: "Warm-up",
    fromQuestion: 1,
    seconds: 12,
    multiplier: 1,
    art: "normal",
    artLabel: "Full colour",
    confusable: false,
    showCategoryHint: true,
    badge: "border-emerald-500/40 bg-emerald-950/60 text-emerald-300",
  },
  {
    id: "developer",
    name: "Developer",
    fromQuestion: 6,
    seconds: 9,
    multiplier: 1.25,
    art: "grayscale",
    artLabel: "Greyscale",
    confusable: true,
    showCategoryHint: false,
    badge: "border-sky-500/40 bg-sky-950/60 text-sky-300",
  },
  {
    id: "architect",
    name: "Architect",
    fromQuestion: 11,
    seconds: 7,
    multiplier: 1.5,
    art: "silhouette",
    artLabel: "Silhouette",
    confusable: true,
    showCategoryHint: false,
    badge: "border-violet-500/40 bg-violet-950/60 text-violet-300",
  },
  {
    id: "legend",
    name: "Legend",
    fromQuestion: 16,
    seconds: 5,
    multiplier: 2,
    art: "blurred",
    artLabel: "Blurred silhouette",
    confusable: true,
    showCategoryHint: false,
    badge: "border-amber-500/40 bg-amber-950/60 text-amber-300",
  },
];

const ART_FILTER: Record<ArtStyle, string> = {
  normal: "",
  grayscale: "grayscale",
  silhouette: "brightness-0 invert",
  blurred: "brightness-0 invert blur-[1.5px]",
};

const MODES: Array<{
  id: ModeId;
  label: string;
  description: string;
  groups: Group[] | null;
}> = [
  { id: "all", label: "Mixed", description: "Everything", groups: null },
  {
    id: "code",
    label: "Code",
    description: "Languages, frameworks, AI",
    groups: ["language", "frontend", "backend", "mobile", "ai"],
  },
  {
    id: "infra",
    label: "Platforms & Infra",
    description: "Cloud, DevOps, databases, tools",
    groups: ["cloud", "devops", "database", "tool"],
  },
];

/* ───────────────────────────── Logo data ───────────────────────────── */

function t(
  id: string,
  name: string,
  category: string,
  group: Group,
  color: string,
  options: { slug?: string; invert?: boolean } = {},
): TechItem {
  return {
    id,
    name,
    category,
    group,
    color,
    slug: options.slug ?? id,
    invert: options.invert ?? false,
  };
}

const TECH_ITEMS: TechItem[] = [
  // Languages
  t("javascript", "JavaScript", "Scripting Language", "language", "#F7DF1E"),
  t("typescript", "TypeScript", "Typed JavaScript", "language", "#3178C6"),
  t("python", "Python", "Programming Language", "language", "#3776AB"),
  t("java", "Java", "JVM Language", "language", "#E76F00"),
  t("csharp", "C#", "Microsoft Language", "language", "#9B4F96"),
  t("cplusplus", "C++", "Systems Language", "language", "#00599C"),
  t("c", "C", "Systems Language", "language", "#A8B9CC"),
  t("go", "Go", "Systems Language", "language", "#00ADD8"),
  t("rust", "Rust", "Systems Language", "language", "#DEA584", { invert: true }),
  t("kotlin", "Kotlin", "JVM / Android Language", "language", "#7F52FF"),
  t("swift", "Swift", "Apple Language", "language", "#F05138"),
  t("php", "PHP", "Server-side Language", "language", "#777BB4"),
  t("ruby", "Ruby", "Dynamic Language", "language", "#CC342D"),
  t("dart", "Dart", "Flutter Language", "language", "#0175C2"),
  t("scala", "Scala", "JVM Language", "language", "#DC322F"),
  t("elixir", "Elixir", "Functional Language", "language", "#8E6BB8"),
  t("haskell", "Haskell", "Functional Language", "language", "#8F7FC4"),
  t("lua", "Lua", "Embeddable Scripting", "language", "#5B6EE1"),
  t("r", "R", "Statistics Language", "language", "#276DC3"),
  t("julia", "Julia", "Scientific Computing", "language", "#9558B2"),
  t("bash", "Bash", "Shell Scripting", "language", "#4EAA25"),

  // Frontend
  t("react", "React", "UI Library", "frontend", "#61DAFB"),
  t("vuejs", "Vue.js", "UI Framework", "frontend", "#4FC08D"),
  t("angular", "Angular", "Web Framework", "frontend", "#DD0031"),
  t("svelte", "Svelte", "Compiler Framework", "frontend", "#FF3E00"),
  t("nextjs", "Next.js", "React Framework", "frontend", "#E4E4E7", { invert: true }),
  t("nuxtjs", "Nuxt", "Vue Framework", "frontend", "#00DC82"),
  t("astro", "Astro", "Content Framework", "frontend", "#FF5D01"),
  t("solidjs", "SolidJS", "Reactive UI Library", "frontend", "#4F88C6"),
  t("gatsby", "Gatsby", "Static Site Generator", "frontend", "#A678E3"),
  t("tailwindcss", "Tailwind CSS", "Utility CSS", "frontend", "#06B6D4"),
  t("bootstrap", "Bootstrap", "CSS Framework", "frontend", "#7952B3"),
  t("sass", "Sass", "CSS Preprocessor", "frontend", "#CC6699"),
  t("vitejs", "Vite", "Build Tool", "frontend", "#646CFF"),
  t("webpack", "Webpack", "Module Bundler", "frontend", "#8DD6F9"),
  t("redux", "Redux", "State Management", "frontend", "#764ABC"),
  t("threejs", "Three.js", "3D Graphics Library", "frontend", "#E4E4E7", { invert: true }),
  t("jquery", "jQuery", "DOM Library", "frontend", "#0769AD"),
  t("html5", "HTML5", "Markup Language", "frontend", "#E34F26"),
  t("css3", "CSS3", "Styling Language", "frontend", "#1572B6"),

  // Backend
  t("nodejs", "Node.js", "JavaScript Runtime", "backend", "#339933"),
  t("express", "Express", "Node Web Framework", "backend", "#E4E4E7", { invert: true }),
  t("nestjs", "NestJS", "Node Framework", "backend", "#E0234E"),
  t("fastify", "Fastify", "Node Framework", "backend", "#E4E4E7", { invert: true }),
  t("django", "Django", "Python Framework", "backend", "#44B78B"),
  t("flask", "Flask", "Python Micro-framework", "backend", "#E4E4E7", { invert: true }),
  t("fastapi", "FastAPI", "Python API Framework", "backend", "#009688"),
  t("spring", "Spring", "Java Framework", "backend", "#6DB33F"),
  t("laravel", "Laravel", "PHP Framework", "backend", "#FF2D20"),
  t("rails", "Ruby on Rails", "Ruby Framework", "backend", "#CC0000"),
  t("dotnetcore", ".NET", "Microsoft Platform", "backend", "#512BD4"),
  t("deno", "Deno", "JS / TS Runtime", "backend", "#E4E4E7", { invert: true }),
  t("bun", "Bun", "JavaScript Runtime", "backend", "#FBF0DF"),
  t("graphql", "GraphQL", "API Query Layer", "backend", "#E10098"),

  // Mobile
  t("flutter", "Flutter", "Cross-platform UI", "mobile", "#02569B"),
  t("android", "Android", "Mobile OS", "mobile", "#3DDC84"),
  t("ionic", "Ionic", "Hybrid Mobile", "mobile", "#3880FF"),

  // AI & data
  t("tensorflow", "TensorFlow", "Machine Learning", "ai", "#FF6F00"),
  t("pytorch", "PyTorch", "Deep Learning", "ai", "#EE4C2C"),
  t("numpy", "NumPy", "Numerical Computing", "ai", "#4DABCF"),
  t("pandas", "pandas", "Data Analysis", "ai", "#8B7CF6"),
  t("jupyter", "Jupyter", "Notebooks", "ai", "#F37626"),
  t("scikitlearn", "scikit-learn", "ML Library", "ai", "#F7931E"),
  t("opencv", "OpenCV", "Computer Vision", "ai", "#5C3EE8"),

  // Databases & messaging
  t("mongodb", "MongoDB", "NoSQL Database", "database", "#47A248"),
  t("postgresql", "PostgreSQL", "Relational Database", "database", "#4169E1"),
  t("mysql", "MySQL", "Relational Database", "database", "#4479A1"),
  t("mariadb", "MariaDB", "Relational Database", "database", "#C0765A"),
  t("sqlite", "SQLite", "Embedded Database", "database", "#44A5D9"),
  t("redis", "Redis", "In-Memory Cache", "database", "#DC382D"),
  t("cassandra", "Cassandra", "Wide-column Database", "database", "#1287B1"),
  t("elasticsearch", "Elasticsearch", "Search Engine", "database", "#FED10A"),
  t("neo4j", "Neo4j", "Graph Database", "database", "#018BFF"),
  t("couchdb", "CouchDB", "Document Database", "database", "#E42528"),
  t("dynamodb", "DynamoDB", "AWS NoSQL Database", "database", "#4053D6"),
  t("kafka", "Apache Kafka", "Event Streaming", "database", "#E4E4E7", {
    slug: "apachekafka",
    invert: true,
  }),
  t("rabbitmq", "RabbitMQ", "Message Broker", "database", "#FF6600"),

  // DevOps & operating systems
  t("docker", "Docker", "Containerization", "devops", "#2496ED"),
  t("kubernetes", "Kubernetes", "Container Orchestration", "devops", "#326CE5"),
  t("terraform", "Terraform", "Infrastructure as Code", "devops", "#844FBA"),
  t("ansible", "Ansible", "Configuration Automation", "devops", "#EE0000"),
  t("jenkins", "Jenkins", "CI/CD Server", "devops", "#D24939"),
  t("githubactions", "GitHub Actions", "CI/CD Workflows", "devops", "#2088FF"),
  t("circleci", "CircleCI", "CI/CD Platform", "devops", "#E4E4E7", { invert: true }),
  t("nginx", "NGINX", "Web Server / Proxy", "devops", "#009639"),
  t("apache", "Apache", "Web Server", "devops", "#D22128"),
  t("prometheus", "Prometheus", "Monitoring", "devops", "#E6522C"),
  t("grafana", "Grafana", "Observability Dashboards", "devops", "#F46800"),
  t("argocd", "Argo CD", "GitOps Delivery", "devops", "#EF7B4D"),
  t("helm", "Helm", "Kubernetes Packages", "devops", "#6C7CFF"),
  t("linux", "Linux", "Operating System", "devops", "#FCC624"),
  t("ubuntu", "Ubuntu", "Linux Distribution", "devops", "#E95420"),
  t("debian", "Debian", "Linux Distribution", "devops", "#E5516B"),
  t("redhat", "Red Hat", "Enterprise Linux", "devops", "#EE0000"),

  // Cloud & hosting platforms
  t("aws", "AWS", "Cloud Platform", "cloud", "#FF9900", { slug: "amazonwebservices" }),
  t("azure", "Microsoft Azure", "Cloud Platform", "cloud", "#0078D4"),
  t("googlecloud", "Google Cloud", "Cloud Platform", "cloud", "#4285F4"),
  t("vercel", "Vercel", "Frontend Cloud", "cloud", "#E4E4E7", { invert: true }),
  t("netlify", "Netlify", "Jamstack Hosting", "cloud", "#00C7B7"),
  t("cloudflare", "Cloudflare", "Edge Network / CDN", "cloud", "#F38020"),
  t("heroku", "Heroku", "Platform as a Service", "cloud", "#7056BF"),
  t("digitalocean", "DigitalOcean", "Cloud Provider", "cloud", "#0080FF"),
  t("firebase", "Firebase", "App Platform", "cloud", "#FFCA28"),
  t("supabase", "Supabase", "Postgres Backend", "cloud", "#3ECF8E"),
  t("oracle", "Oracle Cloud", "Cloud & Database", "cloud", "#F80000"),

  // Developer tools & code hosting
  t("git", "Git", "Version Control", "tool", "#F05032"),
  t("github", "GitHub", "Code Hosting", "tool", "#E4E4E7", { invert: true }),
  t("gitlab", "GitLab", "DevOps Platform", "tool", "#FC6D26"),
  t("bitbucket", "Bitbucket", "Code Hosting", "tool", "#2684FF"),
  t("vscode", "VS Code", "Code Editor", "tool", "#007ACC"),
  t("vim", "Vim", "Terminal Editor", "tool", "#019733"),
  t("npm", "npm", "Package Manager", "tool", "#CB3837"),
  t("yarn", "Yarn", "Package Manager", "tool", "#2C8EBB"),
  t("pnpm", "pnpm", "Package Manager", "tool", "#F69220"),
  t("postman", "Postman", "API Platform", "tool", "#FF6C37"),
  t("figma", "Figma", "Design Platform", "tool", "#F24E1E"),
  t("jira", "Jira", "Issue Tracking", "tool", "#4C9AFF"),
  t("jest", "Jest", "JS Testing", "tool", "#C21325"),
  t("cypress", "Cypress", "E2E Testing", "tool", "#69D3A7"),
  t("selenium", "Selenium", "Browser Automation", "tool", "#43B02A"),
];

/* ───────────────────────────── Helpers ───────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getPool(mode: ModeId): TechItem[] {
  const groups = MODES.find((m) => m.id === mode)?.groups;
  if (!groups) return TECH_ITEMS;
  const pool = TECH_ITEMS.filter((item) => groups.includes(item.group));
  return pool.length >= TOTAL_QUESTIONS ? pool : TECH_ITEMS;
}

function getLevel(questionIndex: number): Level {
  const questionNumber = questionIndex + 1;
  let level = LEVELS[0];
  for (const candidate of LEVELS) {
    if (questionNumber >= candidate.fromQuestion) level = candidate;
  }
  return level;
}

function pickDistractors(
  target: TechItem,
  pool: TechItem[],
  confusable: boolean,
): TechItem[] {
  const others = shuffle(pool.filter((item) => item.id !== target.id));
  if (!confusable) return others.slice(0, 3);

  // Hard levels: look-alikes first (same group), then anything else.
  const sameGroup = others.filter((item) => item.group === target.group);
  const rest = others.filter((item) => item.group !== target.group);
  return [...sameGroup, ...rest].slice(0, 3);
}

function buildDeck(mode: ModeId): LogoQuestion[] {
  const pool = getPool(mode);
  return shuffle(pool)
    .slice(0, TOTAL_QUESTIONS)
    .map((target, index) => {
      const level = getLevel(index);
      const options = shuffle([
        target,
        ...pickDistractors(target, pool, level.confusable),
      ]);
      return { index, level, target, options };
    });
}

function getLogoSources(item: TechItem): string[] {
  return (["original", "plain"] as const).map(
    (variant) => `${DEVICON_BASE}/${item.slug}/${item.slug}-${variant}.svg`,
  );
}

function getInitials(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0] ?? name).slice(0, 2);
}

/* ───────────────────────────── Artwork ───────────────────────────── */

function MonogramLogo({ item }: { item: TechItem }) {
  return (
    <div
      className="grid h-16 w-16 place-items-center rounded-xl text-xl font-bold"
      style={{
        color: item.color,
        backgroundColor: `${item.color}22`,
        border: `1px solid ${item.color}55`,
      }}
    >
      {getInitials(item.name)}
    </div>
  );
}

function StackArtwork({
  item,
  art,
  revealed,
}: {
  item: TechItem;
  art: ArtStyle;
  revealed: boolean;
}) {
  const sources = getLogoSources(item);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  if (sourceIndex >= sources.length) return <MonogramLogo item={item} />;

  const effectiveArt: ArtStyle = revealed ? "normal" : art;
  const needsInvert =
    item.invert && (effectiveArt === "normal" || effectiveArt === "grayscale");
  const filterClass = `${ART_FILTER[effectiveArt]} ${needsInvert ? "invert" : ""}`;

  return (
    <div className="relative grid h-20 w-20 place-items-center">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded-xl bg-zinc-800/60" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={sources[sourceIndex]}
        src={sources[sourceIndex]}
        alt={revealed ? `${item.name} logo` : "Mystery tech logo"}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setSourceIndex((index) => index + 1);
        }}
        className={`h-20 w-20 object-contain transition-[filter,opacity] duration-300 ${filterClass} ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="eager"
        draggable={false}
      />
    </div>
  );
}

/* ───────────────────────────── Game ───────────────────────────── */

export default function StackGuesserGame({
  gameId = "stack-guesser",
  compact = false,
}: StackGuesserGameProps) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [mode, setMode] = useState<ModeId>("all");
  const [questions, setQuestions] = useState<LogoQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [outcome, setOutcome] = useState<Outcome>("eliminated");
  const [survivalBonus, setSurvivalBonus] = useState(0);
  const [choiceFeedback, setChoiceFeedback] = useState<ChoiceFeedback | null>(null);

  const [playerName, setPlayerName] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaderboardTick, setLeaderboardTick] = useState(0);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef(0);
  const lockedRef = useRef(false);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);

  const currentQuestion: LogoQuestion | undefined = questions[currentIdx];
  const currentLevel = currentQuestion?.level ?? LEVELS[0];

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  /* Restore name + best score */
  useEffect(() => {
    try {
      const savedName = localStorage.getItem(NAME_STORAGE_KEY);
      if (savedName) setPlayerName(savedName);
      const savedBest = localStorage.getItem(`best_${gameId}`);
      if (savedBest) setBestScore(Number(savedBest) || 0);
    } catch {
      // storage unavailable
    }
  }, [gameId]);

  useEffect(() => {
    if (bestScore <= 0) return;
    try {
      localStorage.setItem(`best_${gameId}`, String(bestScore));
    } catch {
      // storage unavailable
    }
  }, [bestScore, gameId]);

  /* Round lifecycle */
  const finishRound = (cleared: boolean) => {
    clearAdvanceTimer();
    const bonus = cleared ? livesRef.current * SURVIVAL_BONUS : 0;
    scoreRef.current += bonus;

    setScore(scoreRef.current);
    setSurvivalBonus(bonus);
    setOutcome(cleared ? "cleared" : "eliminated");
    setBestStreak(bestStreakRef.current);
    setChoiceFeedback(null);
    setBestScore((prev) => Math.max(prev, scoreRef.current));
    setGameState("gameover");
  };

  const startGame = () => {
    clearAdvanceTimer();
    setQuestions(buildDeck(mode));
    setCurrentIdx(0);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setLives(STARTING_LIVES);
    setSurvivalBonus(0);
    setChoiceFeedback(null);
    setSubmittedScore(null);
    setSubmitError(null);
    scoreRef.current = 0;
    streakRef.current = 0;
    bestStreakRef.current = 0;
    livesRef.current = STARTING_LIVES;
    lockedRef.current = false;
    setGameState("playing");
  };

  const resolveAnswer = (chosen: TechItem | null) => {
    const question = questions[currentIdx];
    if (gameState !== "playing" || !question || lockedRef.current) return;
    lockedRef.current = true;

    const isCorrect = chosen?.id === question.target.id;
    let pointsEarned = 0;
    let livesAfter = livesRef.current;

    if (isCorrect) {
      const durationMs = question.level.seconds * 1000;
      const remainingMs = Math.max(0, deadlineRef.current - Date.now());
      const nextStreak = streakRef.current + 1;
      const streakBonus = Math.min(15, (nextStreak - 1) * 3);
      const speedBonus = Math.floor((remainingMs / durationMs) * 10);
      pointsEarned = Math.round(
        (20 + streakBonus + speedBonus) * question.level.multiplier,
      );

      scoreRef.current += pointsEarned;
      streakRef.current = nextStreak;
      bestStreakRef.current = Math.max(bestStreakRef.current, nextStreak);

      setScore(scoreRef.current);
      setStreak(nextStreak);
      setCorrectCount((count) => count + 1);
    } else {
      streakRef.current = 0;
      livesAfter = Math.max(0, livesRef.current - 1);
      livesRef.current = livesAfter;

      setStreak(0);
      setLives(livesAfter);
    }

    setChoiceFeedback({
      selectedId: chosen?.id ?? null,
      correctId: question.target.id,
      isCorrect,
      timedOut: chosen === null,
      pointsEarned,
    });

    advanceTimerRef.current = setTimeout(
      () => {
        setChoiceFeedback(null);
        if (livesAfter <= 0) {
          finishRound(false);
        } else if (currentIdx + 1 >= TOTAL_QUESTIONS) {
          finishRound(true);
        } else {
          setCurrentIdx((idx) => idx + 1);
        }
      },
      isCorrect ? 700 : 1500,
    );
  };

  // Always-current references for the timer and keyboard handlers.
  const resolveRef = useRef(resolveAnswer);
  resolveRef.current = resolveAnswer;
  const startRef = useRef(startGame);
  startRef.current = startGame;

  /* Per-question countdown */
  useEffect(() => {
    if (gameState !== "playing" || !currentQuestion) return;

    lockedRef.current = false;
    const durationMs = currentQuestion.level.seconds * 1000;
    deadlineRef.current = Date.now() + durationMs;
    setTimeLeftMs(durationMs);

    const interval = setInterval(() => {
      if (lockedRef.current) {
        clearInterval(interval);
        return;
      }
      const remaining = deadlineRef.current - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeftMs(0);
        resolveRef.current(null);
        return;
      }
      setTimeLeftMs(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, currentIdx, currentQuestion]);

  /* Preload the next two logos so they never pop in */
  useEffect(() => {
    if (gameState !== "playing") return;
    questions.slice(currentIdx + 1, currentIdx + 3).forEach((question) => {
      const image = new Image();
      image.src = getLogoSources(question.target)[0];
    });
  }, [gameState, questions, currentIdx]);

  /* Keyboard: 1–4 to answer, Enter to start / replay */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (gameState === "playing") {
        const idx = ["1", "2", "3", "4"].indexOf(e.key);
        const option = idx === -1 ? undefined : currentQuestion?.options[idx];
        if (option) resolveRef.current(option);
        return;
      }

      if (e.key === "Enter" && tag !== "BUTTON") {
        e.preventDefault();
        startRef.current();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState, currentQuestion]);

  /* Score submission */
  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = playerName.trim();
    if (!trimmed) {
      setSubmitError("Enter your name first.");
      nameInputRef.current?.focus();
      return;
    }
    if (score <= 0 || submittedScore === score) return;

    try {
      setSubmittingScore(true);
      setSubmitError(null);

      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, playerName: trimmed, score }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not save score.");
      }

      try {
        localStorage.setItem(NAME_STORAGE_KEY, trimmed);
      } catch {
        // storage unavailable
      }

      setSubmittedScore(score);
      setLeaderboardTick((n) => n + 1);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save score.");
    } finally {
      setSubmittingScore(false);
    }
  };

  /* Derived UI values */
  const questionDurationMs = currentLevel.seconds * 1000;
  const timePercent = Math.max(0, Math.min(100, (timeLeftMs / questionDurationMs) * 100));
  const secondsLeft = Math.ceil(timeLeftMs / 1000);
  const isLowTime = timeLeftMs <= 3000 && !choiceFeedback;
  const arenaMinHeight = compact ? "min-h-[26rem]" : "min-h-[30rem] lg:min-h-[34rem]";
  const revealed = Boolean(choiceFeedback);
  const poolSizes = Object.fromEntries(MODES.map((m) => [m.id, getPool(m.id).length]));

  return (
    <div className="grid select-none grid-cols-1 items-start gap-5 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-7 xl:col-span-8">
        {/* HUD */}
        <div className="grid grid-cols-2 divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-[#111114] font-mono text-xs sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="px-4 py-3">
            <span className="block text-[10px] text-zinc-500">SCORE</span>
            <span className="text-base font-semibold tabular-nums text-white">{score}</span>
          </div>
          <div className="px-4 py-3">
            <span className="block text-[10px] text-zinc-500">QUESTION</span>
            <span className="text-base font-semibold tabular-nums text-zinc-200">
              {gameState === "idle"
                ? `0/${TOTAL_QUESTIONS}`
                : `${Math.min(currentIdx + 1, TOTAL_QUESTIONS)}/${TOTAL_QUESTIONS}`}
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="block text-[10px] text-zinc-500">STREAK</span>
            <span className="text-base font-semibold tabular-nums text-amber-300">{streak}x</span>
          </div>
          <div className="px-4 py-3">
            <span className="block text-[10px] text-zinc-500">LIVES</span>
            <span
              className="mt-0.5 flex items-center gap-1"
              aria-label={`${lives} of ${STARTING_LIVES} lives left`}
            >
              {Array.from({ length: STARTING_LIVES }, (_, i) => (
                <FiHeart
                  key={i}
                  className={`h-4 w-4 transition-colors ${
                    i < lives ? "fill-rose-500 text-rose-500" : "text-zinc-700"
                  }`}
                />
              ))}
            </span>
          </div>
        </div>

        {/* Question timer */}
        <div className="flex items-center gap-3">
          <div
            role="progressbar"
            aria-label="Time left for this question"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(timePercent)}
            className="h-2 flex-1 overflow-hidden rounded-full border border-zinc-800/80 bg-zinc-900"
          >
            <div
              style={{ width: `${gameState === "playing" ? timePercent : 0}%` }}
              className={`h-full transition-[width] duration-100 ease-linear ${
                isLowTime ? "bg-rose-500" : "bg-emerald-400"
              }`}
            />
          </div>
          <span
            className={`w-8 text-right font-mono text-xs font-semibold tabular-nums ${
              isLowTime ? "text-rose-400" : "text-zinc-300"
            }`}
          >
            {gameState === "playing" ? `${secondsLeft}s` : "–"}
          </span>
        </div>

        {/* Stage */}
        <div
          className={`relative flex w-full flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#111114] p-5 sm:p-7 ${arenaMinHeight}`}
        >
          {gameState === "playing" && currentQuestion ? (
            <div className="w-full max-w-lg space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${currentLevel.badge}`}
                  >
                    {currentLevel.name} · x{currentLevel.multiplier}
                  </span>
                  {currentLevel.art !== "normal" && (
                    <span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-400">
                      {currentLevel.artLabel}
                    </span>
                  )}
                </div>
                <span className="text-zinc-500">Keys 1–4 or click</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-32 w-32 items-center justify-center rounded-2xl border bg-zinc-950 shadow-lg transition-colors duration-200 ${
                    choiceFeedback
                      ? choiceFeedback.isCorrect
                        ? "border-emerald-500/70 shadow-emerald-500/10"
                        : "border-rose-500/70 shadow-rose-500/10"
                      : "border-zinc-800"
                  }`}
                >
                  <StackArtwork
                    key={currentQuestion.target.id}
                    item={currentQuestion.target}
                    art={currentLevel.art}
                    revealed={revealed}
                  />
                </div>
                <p className="h-4 font-mono text-[11px] text-zinc-500">
                  {currentLevel.showCategoryHint
                    ? currentQuestion.target.category
                    : revealed
                      ? currentQuestion.target.category
                      : "Hint hidden at this level"}
                </p>
              </div>

              {/* Feedback */}
              <div className="flex min-h-[28px] items-center justify-center" aria-live="polite">
                {choiceFeedback ? (
                  choiceFeedback.isCorrect ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/70 px-3 py-1 font-mono text-xs text-emerald-300">
                      <FiCheck className="h-3.5 w-3.5" />
                      <span>Correct! +{choiceFeedback.pointsEarned} pts</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/70 px-3 py-1 font-mono text-xs text-rose-300">
                      <FiX className="h-3.5 w-3.5" />
                      <span>
                        {choiceFeedback.timedOut ? (
                          "Time's up"
                        ) : (
                          <>
                            You picked{" "}
                            <strong className="text-rose-200">
                              {
                                currentQuestion.options.find(
                                  (o) => o.id === choiceFeedback.selectedId,
                                )?.name
                              }
                            </strong>
                          </>
                        )}{" "}
                        · Answer:{" "}
                        <strong className="text-emerald-300">
                          {currentQuestion.target.name}
                        </strong>{" "}
                        · −1 life
                      </span>
                    </div>
                  )
                ) : (
                  <p className="font-mono text-xs text-zinc-500">Identify this logo</p>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = choiceFeedback?.selectedId === opt.id;
                  const isCorrectOption = choiceFeedback?.correctId === opt.id;

                  let buttonStyle =
                    "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-100";

                  if (choiceFeedback) {
                    if (isCorrectOption) {
                      buttonStyle =
                        "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40";
                    } else if (isSelected && !choiceFeedback.isCorrect) {
                      buttonStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
                    } else {
                      buttonStyle =
                        "bg-zinc-950/50 border-zinc-800/60 text-zinc-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={Boolean(choiceFeedback)}
                      onClick={() => resolveAnswer(opt)}
                      aria-label={`Option ${idx + 1}: ${opt.name}`}
                      className={`flex cursor-pointer items-center justify-between gap-2.5 rounded-xl border px-4 py-3 font-mono text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 enabled:active:scale-[0.98] disabled:cursor-default ${buttonStyle}`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="shrink-0 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-400">
                          {idx + 1}
                        </span>
                        <span className="truncate font-medium">{opt.name}</span>
                      </span>

                      {choiceFeedback && isCorrectOption && (
                        <span className="shrink-0 text-[10px] font-bold uppercase text-emerald-400">
                          Correct
                        </span>
                      )}
                      {choiceFeedback && isSelected && !choiceFeedback.isCorrect && (
                        <span className="shrink-0 text-[10px] font-bold uppercase text-rose-400">
                          Picked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : gameState === "gameover" ? (
            <div className="w-full max-w-sm space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 text-center">
              <span
                className={`inline-block rounded border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  outcome === "cleared"
                    ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300"
                    : "border-rose-800/60 bg-rose-950/40 text-rose-300"
                }`}
              >
                {outcome === "cleared"
                  ? "All 20 cleared"
                  : `Eliminated at Q${Math.min(currentIdx + 1, TOTAL_QUESTIONS)} · ${currentLevel.name}`}
              </span>

              <div className="space-y-1">
                <p className="font-mono text-4xl font-semibold tabular-nums text-white">
                  {score} <span className="text-lg text-zinc-500">pts</span>
                </p>
                {survivalBonus > 0 && (
                  <p className="font-mono text-[11px] text-emerald-400">
                    Includes +{survivalBonus} survival bonus
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 divide-x divide-zinc-800 rounded-lg border border-zinc-800 font-mono">
                <div className="px-2 py-2.5">
                  <span className="block text-[10px] text-zinc-500">CORRECT</span>
                  <span className="text-sm font-semibold tabular-nums text-zinc-200">
                    {correctCount}/{TOTAL_QUESTIONS}
                  </span>
                </div>
                <div className="px-2 py-2.5">
                  <span className="block text-[10px] text-zinc-500">BEST STREAK</span>
                  <span className="text-sm font-semibold tabular-nums text-amber-300">
                    {bestStreak}x
                  </span>
                </div>
                <div className="px-2 py-2.5">
                  <span className="block text-[10px] text-zinc-500">BEST SCORE</span>
                  <span className="text-sm font-semibold tabular-nums text-emerald-300">
                    {bestScore}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={startGame}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-mono text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400"
              >
                <FiRotateCcw className="h-3.5 w-3.5" />
                <span>Play again · {MODES.find((m) => m.id === mode)?.label}</span>
              </button>

              <div className="flex flex-wrap justify-center gap-1.5">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`cursor-pointer rounded-md border px-2.5 py-1 font-mono text-[10px] transition ${
                      mode === m.id
                        ? "border-emerald-500/60 bg-emerald-950/50 text-emerald-300"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6">
              <div className="space-y-1.5 text-center">
                <p className="text-base font-semibold text-white">Stack Guesser · Hardcore</p>
                <p className="text-xs leading-relaxed text-zinc-400">
                  Name{" "}
                  <span className="font-mono text-zinc-200">20 logos</span> before you run out
                  of <span className="font-mono text-zinc-200">3 lives</span>. Every level is
                  faster and the logos get harder to read.
                </p>
              </div>

              <div role="radiogroup" aria-label="Logo pool" className="grid grid-cols-3 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={mode === m.id}
                    onClick={() => setMode(m.id)}
                    className={`cursor-pointer rounded-lg border px-2 py-2.5 text-left transition ${
                      mode === m.id
                        ? "border-emerald-500/60 bg-emerald-950/40"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <span
                      className={`block font-mono text-[11px] font-semibold ${
                        mode === m.id ? "text-emerald-300" : "text-zinc-200"
                      }`}
                    >
                      {m.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-tight text-zinc-500">
                      {m.description}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] text-zinc-600">
                      {poolSizes[m.id]} logos
                    </span>
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-lg border border-zinc-800 font-mono text-[11px]">
                {LEVELS.map((level) => (
                  <div
                    key={level.id}
                    className="flex items-center justify-between border-b border-zinc-800/80 px-3 py-2 last:border-b-0"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${level.badge}`}
                      >
                        {level.name}
                      </span>
                      <span className="text-zinc-500">Q{level.fromQuestion}+</span>
                    </span>
                    <span className="text-zinc-400">
                      {level.seconds}s · {level.artLabel} · x{level.multiplier}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={startGame}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 font-mono text-xs font-semibold text-zinc-950 transition hover:bg-white"
              >
                <FiPlay className="h-3.5 w-3.5" />
                <span>Start · press Enter</span>
              </button>
              {bestScore > 0 && (
                <p className="text-center font-mono text-[11px] text-zinc-500">
                  Your best: <span className="text-emerald-300">{bestScore} pts</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right column: score submission + leaderboard */}
      <aside className="space-y-4 lg:col-span-5 xl:col-span-4">
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-[#111114] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-medium text-zinc-200">Submit Score</span>
            <span className="font-mono text-xs tabular-nums text-emerald-400">
              Current: {score} pts
            </span>
          </div>

          <form onSubmit={handleScoreSubmit} className="space-y-2.5">
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                maxLength={24}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                aria-label="Your name"
                className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white transition placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={
                  submittingScore ||
                  gameState !== "gameover" ||
                  score <= 0 ||
                  submittedScore === score
                }
                className="shrink-0 cursor-pointer rounded-lg bg-emerald-500 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {submittingScore ? "Saving..." : "Save"}
              </button>
            </div>

            {submittedScore === score && score > 0 && (
              <p className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                <FiCheck className="h-3.5 w-3.5" />
                <span>
                  Saved {score} pts for {playerName.trim()}
                </span>
              </p>
            )}

            {submitError && (
              <p role="alert" className="font-mono text-[11px] text-rose-400">
                {submitError}
              </p>
            )}

            {gameState !== "gameover" && submittedScore !== score && (
              <p className="font-mono text-[11px] text-zinc-500">
                Finish a round to save your score.
              </p>
            )}
          </form>
        </div>

        <Leaderboard
          gameId={gameId}
          limit={10}
          refreshTrigger={leaderboardTick}
          title="Stack Guesser — Top Scores"
          unitLabel="pts"
        />
      </aside>
    </div>
  );
}