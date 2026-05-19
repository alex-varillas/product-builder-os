# BoardOS — CLAUDE.md

> Brief completo: `D:\ProductBuilderOS\product-builder-os-project-brief.md`

## Reglas de trabajo

- **No hacer commits ni push** sin que el usuario lo pida explícitamente.
- **Ante cualquier decisión de producto ambigua**, preguntar antes de avanzar.
- No agregar features fuera del scope definido en el brief.

---

## Qué es

Herramienta open source para builders y founders. Convierte ideas dispersas en productos estructurados. No es un task manager ni un Notion. Se enfoca en tres cosas:

1. **Idea Canvas** — aterrizar la idea (problema, usuario, solución).
2. **MVP Scope** — kanban de 4 columnas: Core MVP / Later / Not Now / To Validate.
3. **Build Log** — documentar avances, decisiones y aprendizajes.

**Momento aha:** el usuario ve el Project Overview completo y siente "Ahora sí tengo mi producto ordenado."

---

## Stack

Next.js · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Auth + PostgreSQL) · Vercel · GitHub público · MIT License

---

## Estructura de carpetas

```
app/(marketing)/     ← landing
app/(auth)/          ← login, signup
app/app/             ← dashboard, projects, settings
components/          ← ui/, marketing/, dashboard/, idea-canvas/, mvp-scope/, build-log/
lib/                 ← supabase/, utils/, validations/
database/migrations/
```

---

## Paleta (light warm)

| Token | Valor |
|---|---|
| Fondo | `#FAFAF8` / warm `#F3EFE7` / stone `#EDE8DF` |
| Card | `#FFFFFF` / warm `#FDFCF9` |
| Border | `#E2DDD4` / soft `#EEEBE4` |
| Texto | `#1A1714` / secundario `#6B6760` / muted `#A09D97` |
| Acento naranja | `#F0620A` · hover `#D95508` |
| Acento violeta | `#6D28D9` |
| Verde | `#15803D` |

Tipografía: **Geist** (sans) + **Geist Mono** (mono). Bordes: `rounded-[22px]` cards, `rounded-[12px]` botones. Sombras sutiles.

---

## v0.1 — Solo esto

Landing · Auth · Dashboard de proyectos · Crear proyecto · Project Overview · Idea Canvas · MVP Scope · Build Log · Export básico Markdown.

**Excluido del v0.1:** IA, colaboración, pagos, integraciones, app móvil, drag & drop, páginas públicas avanzadas, analytics, roles avanzados.
