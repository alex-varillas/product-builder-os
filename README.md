# BoardOS

**Turn scattered ideas into structured products.**

BoardOS is an open source tool for indie builders and small product teams. It gives you three focused modules — Idea Canvas, MVP Scope, and Build Log — to go from raw idea to a clear, shareable product overview.

---

## What's inside

| Module | What it does |
|---|---|
| **Idea Canvas** | Define your product in four cards: Problem, User, Solution, Context. Add custom cards as needed. |
| **MVP Scope** | Kanban board with four columns: Core MVP · Later · Not Now · To Validate. |
| **Build Log** | Document decisions, shipped work, insights, and next steps with dated entries. |
| **Export** | Download any project as a Markdown file or a formatted PDF. |

---

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI components:** shadcn/ui
- **Auth + Database:** Supabase (PostgreSQL)
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
database/migrations/001_initial_schema.sql
database/migrations/002_add_mvp_columns.sql
```

These create the tables for projects, canvas cards, MVP items, log entries, and inbox ideas.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign up and you're in.

---

## How to use it

### Creating a project

1. Sign in and go to the **Dashboard**
2. Click **New project**, give it a name and pick a color
3. Open the project to access its three modules

### Idea Canvas

Fill in the four fixed cards (Problem, User, Solution, Context) by clicking **Edit →** on each one. Add extra custom cards with the **+ Add card** button in the toolbar. Cards are saved automatically.

### MVP Scope

Add features with **+ New item**. Set a column (Core MVP, Later, Not Now, To Validate), a priority (P0–P3), and optionally a reason. Mark items as done with the checkbox. Completed items move to a Done section at the bottom.

### Build Log

Click **+ New entry** to log a decision, shipped update, insight, or next step. Each entry gets a date and a type tag. Entries are ordered newest-first.

### Exporting

Click **Export** from the project toolbar. Choose **Markdown** for a plain-text file or **PDF** for a formatted document. Select which sections to include, then click **Download**.

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

Please keep contributions focused on the v0.1 scope: Canvas, Scope, Log, and Export. Features like AI, collaboration, or payments are planned for later versions.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
