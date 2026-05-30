# BoardOS

**Your daily operating system for building products with intention.**

BoardOS is an open source workspace for indie builders and founders. It combines a structured product thinking space (Idea Canvas, MVP Scope, Build Log) with a daily focus layer (Today planner, Pomodoro timer, build streak) — everything you need to go from raw idea to shipped product, day by day.

---

## What's inside

| View | What it does |
|---|---|
| **Home Dashboard** | Weekly build hours by project, monthly calendar heatmap, focus goal progress, build streak, and recent log entries. |
| **Today Planner** | Visual 6 am–10 pm timeline with draggable, resizable time blocks. Navigate the week, snap to 15-min grid, mark blocks done. |
| **Pomodoro Timer** | Focus/break timer with configurable durations, long-break cycles, session logging, and a persistent mini-bar across all views. |
| **Idea Canvas** | Four fixed slots (Problem, User, Solution, Context) + custom cards. Inline editing, badge system (core, hypothesis, signal, validated, draft, insight). |
| **MVP Scope** | Four-column Kanban: Core MVP · Later · Not Now · To Validate. Drag-and-drop, priority (P1–P3), reasoning field, done toggle. |
| **Build Log** | Typed entries: Shipped, Decision, Insight, Idea. Day-grouped feed, type filter chips, Cmd/Ctrl+Enter to save. |
| **Ideas Inbox** | Capture raw, unstructured ideas without linking them to a project. Edit or delete anytime. |

---

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom CSS design system
- **Animations:** Motion (Framer Motion)
- **Drag & drop:** dnd-kit
- **Auth + Database:** Supabase (PostgreSQL + RLS)
- **Deployment:** Vercel

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/alex-varillas/product-builder-os.git
cd product-builder-os
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy your URL and anon key
3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the database migrations

Open the **SQL Editor** in your Supabase dashboard and run the migrations in order:

```
database/migrations/001_initial_schema.sql    — projects, canvas_cards, mvp_items, log_entries, inbox_ideas
database/migrations/002_add_mvp_columns.sql   — adds priority, why, done to mvp_items
database/migrations/003_node_links.sql        — cross-item linking table
database/migrations/004_time_blocks.sql       — time_blocks for the Today planner
database/migrations/005_pomodoro_sessions.sql — pomodoro_sessions tracking
database/migrations/006_user_preferences.sql  — per-user settings (focus durations, daily goal)
```

All tables use Row Level Security — users only ever see their own data.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign up and you're in.

---

## How to use it

### Creating a project

1. Sign in and go to **All Projects**
2. Click **New project**, give it a name and pick a color
3. Open the project to access Idea Canvas, MVP Scope, and Build Log

### Idea Canvas

Click any of the four fixed cards (Problem, User, Solution, Context) to edit inline. Add extra custom cards with **+ Add card** in the toolbar. Each card supports a badge tag to mark its status.

### MVP Scope

Click **+ New item** to add a feature. Set its column, priority, and an optional reason. Drag cards between columns to reorganize. Click a card to open the detail modal and toggle it done.

### Build Log

Click **+ New entry** or use the compose bar at the top of the log. Pick a type (Shipped, Decision, Insight, Idea), write your entry, and press **Cmd/Ctrl+Enter** to save. Entries are grouped by day.

### Today Planner

Click any slot on the timeline to create a time block. Fill in a label, optional project link, start/end times, and color. Drag a block to reschedule it; drag its top or bottom edge to resize. Click a block to edit or delete it.

### Pomodoro Timer

Go to **Pomodoro** in the sidebar. Choose Focus or Break, then hit Start. A mini timer bar appears at the bottom of every other view so you always know your remaining time. Configure durations in **Settings**.

### Ideas Inbox

Go to **Ideas Inbox** and type anything — rough thoughts, links, fragments. These are intentionally unstructured and not tied to any project. Move them to a Canvas or Scope card manually when the time comes.

### Settings

Adjust your Pomodoro durations (focus, break, long break), sessions before long break, daily focus goal, and UI language (English / Español).

### Search

Press **Cmd/Ctrl+K** from anywhere in the app to open global search. It searches across all your projects' MVP items, Canvas cards, and Build Log entries.

### Export

Open a project and click **Export** in the toolbar. Select which sections to include (Canvas, Scope, Log) and download as a Markdown file.

---

## Deploying to Vercel

1. Push your fork to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Add your environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — Vercel detects Next.js automatically

---

## Contributing

BoardOS is open source under the MIT license. Pull requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes and open a pull request

The current scope (v0.3) covers the full daily workspace: landing, auth, home dashboard, today planner, pomodoro, idea canvas, MVP scope, build log, ideas inbox, search, export, settings, and EN/ES i18n. Contributions that improve or polish these areas are most welcome.

Features planned for later versions: AI assistance, team collaboration, public project pages, PDF export, and email digests.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
