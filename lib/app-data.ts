export interface Project {
  id: string;
  name: string;
  color: string;
  version: string;
  stage: "draft" | "shipped" | "";
  desc?: string;
}

export type FixedCardId = "problem" | "user" | "solution" | "context";

export interface IdeaCard {
  id: FixedCardId;
  tag: { label: string; color: string; bg: string };
  text: string;
  updated: string;
}

export type KanbanColumn = "core-mvp" | "later" | "not-now" | "to-validate";

export interface MVPItem {
  id: string;
  name: string;
  column: KanbanColumn;
  priority: "P1" | "P2" | "P3";
  why: string;
  done?: boolean;
}

export interface CustomCard {
  id: string;
  name: string;
  text: string;
  updated: string;
}

export const KANBAN_COLUMNS: { id: KanbanColumn; color: string }[] = [
  { id: "core-mvp",    color: "#F0620A" },
  { id: "later",       color: "#6D28D9" },
  { id: "not-now",     color: "#A09D97" },
  { id: "to-validate", color: "#0D9488" },
];

export type LogType = "shipped" | "decision" | "insight" | "idea";

export interface LogEntry {
  id: string;
  date: string;
  text: string;
  type: LogType;
}

export interface SearchResult {
  proj: string;
  item: string;
  type: string;
  color: string;
}

export const PROJECTS: Project[] = [
  { id: "1", name: "BoardOS",        color: "#F0620A", version: "v0.2", stage: "draft",   desc: "Open-source workspace for builders and founders." },
  { id: "2", name: "Reflow CRM",     color: "#6D28D9", version: "v0.1", stage: "draft",   desc: "Lightweight CRM built for solo freelancers." },
  { id: "3", name: "LocalStack CLI", color: "#15803D", version: "v1.3", stage: "shipped", desc: "CLI tool for running AWS services locally." },
  { id: "4", name: "Scratchpad",     color: "#A09D97", version: "",     stage: "",        desc: "Quick notes and rough ideas." },
];

export const IDEA_CARDS: IdeaCard[] = [
  {
    id: "problem",
    tag: { label: "core", color: "#F0620A", bg: "#FEF0E8" },
    text: "Founders spend hours each week maintaining scattered notes, docs, and Notion pages that don't reflect the current state of their product thinking.",
    updated: "2d ago",
  },
  {
    id: "user",
    tag: { label: "hypothesis", color: "#6D28D9", bg: "#F0EAFF" },
    text: "Solo founders and indie hackers, 0-5 team size, technical or design background. Building SaaS or tools they would use themselves every day.",
    updated: "5d ago",
  },
  {
    id: "solution",
    tag: { label: "core", color: "#F0620A", bg: "#FEF0E8" },
    text: "A structured, opinionated workspace that captures product decisions, scopes MVPs, and tracks shipped work, all in one focused, distraction-free view.",
    updated: "1d ago",
  },
  {
    id: "context",
    tag: { label: "signal", color: "#15803D", bg: "#E8F5EE" },
    text: "Market moment: AI tools are proliferating but product clarity is getting worse. Builders need structure and intentionality, not more features.",
    updated: "3d ago",
  },
];

export const MVP_ITEMS: MVPItem[] = [
  { id: "1",  name: "Idea Canvas view",          column: "core-mvp",    priority: "P1", why: "Core of the product. Without it, there is no BoardOS." },
  { id: "2",  name: "Project sidebar navigation", column: "core-mvp",    priority: "P1", why: "Users need to navigate between projects without friction." },
  { id: "3",  name: "Inline card editing",        column: "core-mvp",    priority: "P1", why: "Static cards are useless. Content must be editable from day one." },
  { id: "4",  name: "Build Log entries",          column: "core-mvp",    priority: "P2", why: "Documentation is the whole point. Needed in v0.1." },
  { id: "5",  name: "Ideas inbox",                column: "later",       priority: "P2", why: "Useful but not blocking the core loop." },
  { id: "6",  name: "Export to Markdown",         column: "later",       priority: "P3", why: "Low effort, nice to have, but not the priority right now." },
  { id: "7",  name: "AI Reframe",                 column: "not-now",     priority: "P1", why: "AI features excluded from v0.1 intentionally. Too much scope and distraction." },
  { id: "8",  name: "Team collaboration",         column: "not-now",     priority: "P2", why: "Solo builders first. Collaboration adds complexity we're not ready for." },
  { id: "9",  name: "Public project pages",       column: "to-validate", priority: "P2", why: "Could be powerful for building in public. Need to validate demand first." },
  { id: "10", name: "Weekly digest email",        column: "to-validate", priority: "P3", why: "Interesting idea but unsure if users would use it. Needs testing before committing." },
];

export const LOG_ENTRIES: LogEntry[] = [
  {
    id: "1",
    date: "May 18",
    text: "Shipped initial sidebar and project navigation. Feeling good about the structure, clean, no clutter.",
    type: "shipped",
  },
  {
    id: "2",
    date: "May 16",
    text: "Decided to drop timeline view from v0.2. Too much scope, not enough clarity. Keeping it to Canvas and Scope for now.",
    type: "decision",
  },
  {
    id: "3",
    date: "May 14",
    text: "First user test with a builder. Biggest insight: people want to see the why alongside the what. Need to surface hypothesis tags more prominently.",
    type: "insight",
  },
  {
    id: "4",
    date: "May 11",
    text: "Started building the Idea Canvas. 2x2 grid feels right, Problem, User, Solution, Context. No more, no less.",
    type: "shipped",
  },
];

export const LOG_TYPE_CFG = {
  shipped:  { color: "#15803D", label: "Shipped"  },
  decision: { color: "#6D28D9", label: "Decision" },
  insight:  { color: "#F0620A", label: "Insight"  },
  idea:     { color: "#0D9488", label: "Idea"     },
} as const;

export const SEARCH_RESULTS: SearchResult[] = [
  { proj: "BoardOS",        item: "Problem statement",       type: "Idea Canvas", color: "#F0620A" },
  { proj: "BoardOS",        item: "MVP: Inline card editing", type: "MVP Scope",   color: "#F0620A" },
  { proj: "Reflow CRM",     item: "User research notes",     type: "Idea Canvas", color: "#6D28D9" },
  { proj: "LocalStack CLI", item: "v1.3 shipped",            type: "Build Log",   color: "#15803D" },
];
