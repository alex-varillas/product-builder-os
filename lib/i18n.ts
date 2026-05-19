export const translations = {
  en: {
    nav: {
      features: "Features",
      openSource: "Open source",
      startBuilding: "Start building",
    },
    hero: {
      badge: "Open source · v0.1",
      h1: ["Organize your ideas.", "Define your MVP.", "Document every step."],
      subtext:
        "BoardOS is an open-source workspace for builders and founders who want to move from scattered ideas to structured products, with more clarity.",
      ctaPrimary: "Start building",
      ctaGithub: "View on GitHub",
      proof: ["MIT licensed", "Self-host or hosted", "No account required to try"],
    },
    problem: {
      badge: "The problem",
      h2: "Building fast shouldn't mean building messy.",
      subtext:
        "Ideas, decisions and progress end up scattered across notes, chats, and loose docs. BoardOS brings the whole build process together, from first spark to documented progress.",
    },
    modules: {
      badge: "The system",
      h2: "One system, three modules.",
      subtext:
        "Each module solves one sharp problem. Together they form the loop: idea → scope → progress → next idea.",
      m1: {
        tag: "Idea Canvas",
        title: "Map the problem space.",
        desc: "Capture the problem, user, solution and context on a single structured canvas. One source of truth for what you're building and why.",
      },
      m2: {
        tag: "MVP Scope",
        title: "Decide what ships first.",
        desc: "Move features between In MVP and Later without losing the reasoning behind each decision.",
      },
      m3: {
        tag: "Build Log",
        title: "Document as you build.",
        desc: "Log progress, decisions, learnings and next steps. A timestamped trail that turns every working session into a useful artifact.",
      },
    },
    steps: {
      badge: "How it works",
      h2: "Get started in minutes.",
      items: [
        {
          n: "01",
          title: "Create your product",
          desc: "Name it, drop in the rough idea. No setup wizard. No friction. You're ready in under a minute.",
        },
        {
          n: "02",
          title: "Define your MVP",
          desc: "Use the Idea Canvas and MVP Scope to separate the essential from the eventual.",
        },
        {
          n: "03",
          title: "Document progress",
          desc: "Log decisions and learnings as you build. Your future self will thank your present one.",
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
      h2: "Start with one product idea.",
      subtext:
        "Turn your next idea into a clearer, more focused, well-documented product.",
      cta: "Start building",
    },
    footer: {
      tagline: "An open-source workspace for taking ideas from scribble to shipped.",
      docs: "Docs",
      license: "License (MIT)",
      copyright: "© 2026 BoardOS · Made for builders.",
      status: "All systems normal",
    },
  },

  es: {
    nav: {
      features: "Características",
      openSource: "Código abierto",
      startBuilding: "Empezar",
    },
    hero: {
      badge: "Open source · v0.1",
      h1: ["Organiza tus ideas.", "Define tu MVP.", "Documenta cada paso."],
      subtext:
        "BoardOS es un workspace open source para builders y founders que quieren pasar de ideas dispersas a productos estructurados, con más claridad.",
      ctaPrimary: "Empezar",
      ctaGithub: "Ver en GitHub",
      proof: ["Licencia MIT", "Self-host o hosted", "Sin cuenta para probar"],
    },
    problem: {
      badge: "El problema",
      h2: "Construir rápido no debería significar construir desordenado.",
      subtext:
        "Ideas, decisiones y avances quedan dispersos en notas, chats y documentos sueltos. BoardOS centraliza todo el proceso, desde la primera idea hasta el avance documentado.",
    },
    modules: {
      badge: "El sistema",
      h2: "Un sistema, tres módulos.",
      subtext:
        "Cada módulo resuelve un problema concreto. Juntos forman el loop: idea → scope → avance → siguiente idea.",
      m1: {
        tag: "Idea Canvas",
        title: "Mapea el espacio del problema.",
        desc: "Captura el problema, usuario, solución y contexto en un canvas estructurado. Una fuente de verdad sobre qué estás construyendo y por qué.",
      },
      m2: {
        tag: "MVP Scope",
        title: "Decide qué sale primero.",
        desc: "Mueve features entre En MVP y Después sin perder el razonamiento detrás de cada decisión.",
      },
      m3: {
        tag: "Build Log",
        title: "Documenta mientras construyes.",
        desc: "Registra avances, decisiones, aprendizajes y próximos pasos. Un historial con fecha que convierte cada sesión de trabajo en un artefacto útil.",
      },
    },
    steps: {
      badge: "Cómo funciona",
      h2: "Empieza en minutos.",
      items: [
        {
          n: "01",
          title: "Crea tu producto",
          desc: "Ponle nombre, escribe la idea básica. Sin wizard de configuración. Sin fricción. Listo en menos de un minuto.",
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
      h2: "Empieza con una idea de producto.",
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
      status: "Todo en orden",
    },
  },
} as const;

export type Lang = keyof typeof translations;
