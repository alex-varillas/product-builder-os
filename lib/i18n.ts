export const translations = {
  en: {
    nav: {
      workspace: "Workspace",
      openSource: "Open source",
      startBuilding: "Start building",
    },
    hero: {
      badge: "· v0.3 · just shipped",
      h1: ["Organize your ideas.", "Define your MVP.", "Document every step."],
      subtext:
        "A focused workspace where founders turn scattered thoughts into structured products, day by day.",
      ctaPrimary: "Start building",
      ctaGithub: "Star on GitHub",
      proof: ["Open source", "MIT license", "Self-hostable"],
    },
    everything: {
      badge: "everything you need",
      h2: "Everything you need to ship.",
      subtext: "Plan your week, define your scope, and document your progress — all in one focused workspace.",
      items: [
        { title: "Plan & focus", desc: "Block your week, run Pomodoro sessions, and protect deep work time." },
        { title: "Define scope", desc: "4-column kanban to separate must-ship from nice-to-have." },
        { title: "Build log", desc: "Document every decision, insight, and win as you build." },
      ],
    },
    workspace: {
      badge: "workspace",
      h2: "Your daily operating system",
      subtext: "Everything aligned around what you build today.",
      home: { tag: "Project", title: "Project Overview", desc: "Idea Canvas, MVP Scope, and Build Log — everything about a product in one view." },
      today: { tag: "Today", title: "Plan deep work", desc: "Schedule timeline blocks across the week. Navigate Mon–Sun freely." },
      pomo: { tag: "Pomodoro", title: "Focus mode", desc: "Dedicated countdown with your durations. Dark mode included." },
    },
    perProject: {
      badge: "per project",
      h2: "Every product, structured",
      subtext: "From rough idea to shipped feature, in one place.",
      canvas: { tag: "Canvas", title: "Idea Canvas", desc: "Capture problem, user, solution, and context on one canvas.", bullets: ["Problem, user, solution & context", "Hypothesis and signal tags", "Inline editing, always visible"] as const },
      scope: { tag: "Scope", title: "MVP Scope", desc: "Four-column kanban to separate essential from eventual.", bullets: ["Core MVP · Later · Not Now · To Validate", "Move items across lanes", "Focus on what ships first"] as const },
      log: { tag: "Log", title: "Build Log", desc: "Document decisions and progress with timestamps.", bullets: ["shipped · idea · insight · decision types", "Timestamped entries", "Linked to each project"] as const },
    },
    steps: {
      badge: "How it works",
      h2: "Get started in 3 steps.",
      subtext: "No setup wizard, no friction. Create your first product in under a minute.",
      items: [
        {
          n: "01",
          title: "Create your product",
          desc: "Name it, drop in the rough idea. No setup wizard. No friction. Ready in under a minute.",
        },
        {
          n: "02",
          title: "Define your MVP",
          desc: "Use the Idea Canvas and MVP Scope to separate the essential from the eventual.",
        },
        {
          n: "03",
          title: "Document progress",
          desc: "Log decisions and learnings as you build. Your future self will thank you.",
        },
      ],
    },
    openSource: {
      badge: "Open source",
      h2: ["Open source", "by default."],
      subtext:
        "Use the hosted version, or run BoardOS locally from GitHub. The core stays open, for any builder to use, adapt and contribute.",
      ctaGithub: "View GitHub repo",
      ctaDocs: "Read the docs",
      stats: ["Stars", "Forks", "License"],
    },
    cta: {
      badge: "Ready when you are",
      h2: "Build with intention.",
      subtext:
        "Turn your next idea into a clearer, more focused, well-documented product.",
      cta: "Start building",
    },
    footer: {
      tagline: "An open-source workspace for taking ideas from scribble to shipped.",
      docs: "Docs",
      license: "License (MIT)",
      copyright: "© 2026 BoardOS · Made for builders.",
      status: "v0.3 · In active development",
    },
  },

  es: {
    nav: {
      workspace: "Workspace",
      openSource: "Código abierto",
      startBuilding: "Empezar",
    },
    hero: {
      badge: "· v0.3 · recién lanzado",
      h1: ["Organiza tus ideas.", "Define tu MVP.", "Documenta cada paso."],
      subtext:
        "Un workspace enfocado donde founders convierten pensamientos dispersos en productos estructurados, día a día.",
      ctaPrimary: "Empezar",
      ctaGithub: "Star en GitHub",
      proof: ["Open source", "Licencia MIT", "Self-hostable"],
    },
    everything: {
      badge: "todo lo que necesitas",
      h2: "Todo lo que necesitas para lanzar.",
      subtext: "Planifica tu semana, define tu scope y documenta tu avance — todo en un workspace enfocado.",
      items: [
        { title: "Planifica y enfócate", desc: "Bloquea tu semana, corre Pomodoros y protege el trabajo profundo." },
        { title: "Define el scope", desc: "Kanban de 4 columnas para separar lo esencial de lo eventual." },
        { title: "Build Log", desc: "Documenta cada decisión, aprendizaje y victoria mientras construyes." },
      ],
    },
    workspace: {
      badge: "workspace",
      h2: "Tu sistema operativo diario",
      subtext: "Todo alineado alrededor de lo que construyes hoy.",
      home: { tag: "Proyecto", title: "Project Overview", desc: "Idea Canvas, MVP Scope y Build Log — todo sobre un producto en una sola vista." },
      today: { tag: "Today", title: "Planifica trabajo profundo", desc: "Programa bloques en la semana. Navega de lunes a domingo libremente." },
      pomo: { tag: "Pomodoro", title: "Modo enfoque", desc: "Cuenta atrás dedicada con tus duraciones. Incluye modo oscuro." },
    },
    perProject: {
      badge: "por proyecto",
      h2: "Cada producto, estructurado",
      subtext: "Desde la idea hasta el feature lanzado, en un solo lugar.",
      canvas: { tag: "Canvas", title: "Idea Canvas", desc: "Captura problema, usuario, solución y contexto en un canvas.", bullets: ["Problema, usuario, solución y contexto", "Etiquetas de hipótesis y señal", "Edición en línea, siempre visible"] as const },
      scope: { tag: "Scope", title: "MVP Scope", desc: "Kanban de cuatro columnas para separar lo esencial de lo eventual.", bullets: ["Core MVP · Later · Not Now · To Validate", "Mueve ítems entre columnas", "Prioridad sobre lo que se lanza primero"] as const },
      log: { tag: "Log", title: "Build Log", desc: "Documenta decisiones y avances con marcas de tiempo.", bullets: ["shipped · idea · insight · decision: tipos", "Entradas con marca de tiempo", "Vinculadas a cada proyecto"] as const },
    },
    steps: {
      badge: "Cómo funciona",
      h2: "Empieza en 3 pasos.",
      subtext: "Sin wizard de configuración, sin fricción. Crea tu primer producto en menos de un minuto.",
      items: [
        {
          n: "01",
          title: "Crea tu producto",
          desc: "Ponle nombre, escribe la idea básica. Sin wizard. Sin fricción. Listo en menos de un minuto.",
        },
        {
          n: "02",
          title: "Define tu MVP",
          desc: "Usa el Idea Canvas y el MVP Scope para separar lo esencial de lo eventual.",
        },
        {
          n: "03",
          title: "Documenta el avance",
          desc: "Registra decisiones y aprendizajes mientras construyes. Tu yo del futuro te lo agradecerá.",
        },
      ],
    },
    openSource: {
      badge: "Open source",
      h2: ["Open source", "por defecto."],
      subtext:
        "Usa la versión hosted o corre BoardOS localmente desde GitHub. El core permanece abierto, para que cualquier builder lo use, adapte y mejore.",
      ctaGithub: "Ver repositorio en GitHub",
      ctaDocs: "Ver documentación",
      stats: ["Estrellas", "Forks", "Licencia"],
    },
    cta: {
      badge: "Listo cuando tú lo estés",
      h2: "Construye con intención.",
      subtext:
        "Convierte tu próxima idea en un producto más claro, enfocado y bien documentado.",
      cta: "Empezar",
    },
    footer: {
      tagline:
        "Un workspace open source para llevar ideas del papel al lanzamiento.",
      docs: "Documentación",
      license: "Licencia (MIT)",
      copyright: "© 2026 BoardOS · Hecho para builders.",
      status: "v0.3 · En desarrollo activo",
    },
  },
} as const;

export type Lang = keyof typeof translations;
