# BoardOS — CLAUDE.md

> Brief completo: `D:\ProductBuilderOS\product-builder-os-project-brief.md`

## Reglas de trabajo

- **No hacer commits ni push** sin que el usuario lo pida explícitamente.
- **Ante cualquier decisión de producto ambigua**, preguntar antes de avanzar.
- No agregar features fuera del scope definido en el brief.

---

## Qué es

Herramienta open source para builders y founders. Sistema operativo diario para construir productos con intención. No es un task manager ni un Notion. Combina un espacio de pensamiento de producto con una capa de foco diario:

1. **Home Dashboard** — métricas de la semana: horas por proyecto, calendario, streak, goal de foco.
2. **Today Planner** — timeline visual 6am–10pm con bloques de tiempo arrastrables y navegación semanal.
3. **Pomodoro** — timer de foco/descanso configurable, barra persistente, sesiones guardadas en DB.
4. **Idea Canvas** — aterrizar la idea (problema, usuario, solución, contexto) + tarjetas custom.
5. **MVP Scope** — kanban de 4 columnas: Core MVP / Later / Not Now / To Validate, drag & drop.
6. **Build Log** — documentar avances, decisiones y aprendizajes con tipos y filtros.
7. **Ideas Inbox** — capturar ideas en bruto sin vincularlas a un proyecto.

**Momento aha:** el usuario ve el Project Overview completo y siente "Ahora sí tengo mi producto ordenado."

---

## Stack

Next.js · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Auth + PostgreSQL) · Vercel · GitHub público · MIT License

---

## Estructura de carpetas

```
app/(landing)/       ← landing page + landing.css
app/(auth)/          ← login, signup, auth.css
app/app/             ← shell principal + settings
components/app/      ← todas las vistas, cards y modales de la app (~28 archivos, organización plana)
components/landing/  ← todas las secciones del landing
components/ui/       ← primitivos compartidos (icons, AppSelect)
lib/                 ← app-data, app-i18n, i18n, supabase/, pomodoro, time-blocks, preferences, analytics, motion, graph
database/migrations/ ← 001–006
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

> **Nota**: la paleta above aplica al **app** (`app/app/app.css`). El landing tiene su propio sistema independiente (ver abajo).

---

## Paleta del landing (design system independiente — beside.com + bindplane.com)

`app/(landing)/landing.css` usa su propio sistema, inspirado en beside.com + bindplane.com. El app conserva los tokens warm.

| Token | Valor |
|---|---|
| Fondo | `#ffffff` / stone alt `#F7F7F5` |
| Texto | `#0F0F10` / secundario `rgba(15,15,16,0.5)` |
| Acento naranja | `#F0620A` — **solo en eyebrows y badges** |
| Bordes | `rgba(0,0,0,0.07)` universal |
| Sombra card | `0 0 0 1px rgba(0,0,0,0.06), 0 2px 16px rgba(0,0,0,0.07)` |
| Botón primario | `#111111` pill / hover `#000` |
| Botón secundario | `border: 1px solid rgba(0,0,0,0.14)` / fondo blanco |
| Radius cards | `20px` |
| Spacing sección | `128px` |

Subtítulos de cards y body text: gris neutro (`rgba(15,15,16,0.5)`). **No naranja en body text**, solo en eyebrows.

---

## v0.3 — Lo que está shipped

✅ Landing · Auth · Home Dashboard · Today Planner · Pomodoro Timer
✅ Idea Canvas · MVP Scope · Build Log · Ideas Inbox
✅ Search global (Cmd+K) · Export Markdown · Settings · Onboarding tour
✅ EN/ES i18n · Drag & drop (dnd-kit) · Animaciones (Motion) · Toast notifications
✅ 6 migraciones DB: projects, canvas_cards, mvp_items, log_entries, inbox_ideas, time_blocks, pomodoro_sessions, user_preferences, node_links

**Excluido (próximas versiones):** IA, colaboración, pagos, app móvil, páginas públicas, export PDF funcional, UI de node links, email digests, roles avanzados.
