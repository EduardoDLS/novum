# Novum Design System

## Overview

**Novum** is a filmmaking agency (GDL, MX) that creates strategic visual narratives for personal brands seeking to position, differentiate, and communicate with authority through audiovisual language. The platform is an internal production management tool that manages the video production workflow from client idea to publication.

**Brand Concept:** _Modern Authority_ — leadership, control, visual credibility. Minimalist, contemporary, precise. Strength through clarity, not excess.

**Brand Manifesto Excerpt:** "No seguimos tendencias, construimos presencia." (We don't follow trends, we build presence.)

---

## Sources

- **Codebase:** `Novum/` (local mount) — Next.js 14 + Tailwind CSS + shadcn/ui + Supabase
- **Branding PDF:** `uploads/BRANDING_NOVUM_V3.pdf` — by Create Things agency, 2025
- **Fonts:** `uploads/ARLON BLACK.ttf`, `uploads/CENTURY GOTHIC_*.ttf` → copied to `fonts/`
- **Logos/Assets:** `uploads/WORDMARK-*.svg`, `uploads/ISOLOGO-*.svg` → copied to `assets/`

---

## Product Context

The Novum platform has **two distinct user-facing surfaces**:

### 1. Portal del Cliente (Client Portal)
- Route group: `(cliente)` — accessible by `role: 'cliente'`
- **Kanban** (`/kanban`): 5-column personal production board: Baby Idea → Guionizar → Grabación → Edición → Publicado
- **Calendario** (`/calendario`): Monthly delivery calendar with status badges
- **Ver Guion**: Script viewer (table: Part / Script / Modulación / Emoción)
- Navigation: slim top header with logo + client name + logout

### 2. Dashboard Interno (Internal Dashboard)
- Route group: `(dashboard)` — accessible by `role: 'admin' | 'editor' | 'guionista'`
- **Hub de Edición** (`/hub-edicion`): Global delivery calendar (all clients, week/month toggle)
- **Clientes** (`/clientes`): Client profiles with analytics metrics
- **Guiones / Scripts** (`/scripts`): Script review queue (approve/reject)
- **Recursos** (`/recursos`): Asset/template grid
- Navigation: 240px left sidebar with logo, vertical menu using Lucide icons

### User Roles
- `cliente` — sees personal portal only
- `editor`, `guionista`, `admin` — see internal dashboard
- Routing: `homeForRole('cliente')` → `/kanban`; internal roles → `/hub-edicion`

---

## CONTENT FUNDAMENTALS

- **Language:** Spanish (es-MX). All UI copy is in Spanish.
- **Tone:** Professional, calm, authoritative. Concise. No exclamation marks or emoji in UI. No slang.
- **Casing:** Sentence case for nav items and labels. ALL CAPS for section headings/badges in branding contexts.
- **Voice:** Second person (tú/usted informal). Direct. Example: _"Tus ideas y videos en producción."_
- **Numbers:** Large metrics displayed prominently — numbers tell the story.
- **Microcopy style:** Short, functional. Example: _"Inicia sesión para continuar"_, _"Guiones generados pendientes de revisión."_
- **No emoji** in any UI surface.
- **No decorative punctuation** — clean, editorial tone.

---

## VISUAL FOUNDATIONS

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--charcoal-black` | `#121417` | Primary backgrounds, nav sidebar, institutional surfaces |
| `--warm-white` | `#F5F5F2` | Clean page backgrounds, editorial breathing room |
| `--graphite-gray` | `#6E7278` | Secondary text, labels, muted elements |
| `--steel-blue` | `#2F4A68` | Strategic accent — CTAs, active states, links, primary buttons |
| `--cold-silver` | `#D0D3D8` | Subtle borders, dividers, premium detail |

### Typography
- **Body / UI text:** Century Gothic — weights: Delgada (thin), Regular, Grues (bold), UltraGruesa (black)
- **Accent / Display headings:** Arlon Black — used for brand headers, kanban column titles, large metric numbers
- **Fallbacks:** `'Century Gothic', AppleGothic, 'Trebuchet MS', sans-serif`
- **Scale:** xs=11px, sm=12px, base=14px, md=16px, lg=20px, xl=24px, 2xl=32px, 3xl=48px
- **Line heights:** tight (1.2) for display, normal (1.5) for body, relaxed (1.7) for editorial

### Spacing
- Base unit: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Generous whitespace — layouts breathe. No cramming.
- Container max-width: 1400px (2xl), centered

### Borders & Radius
- Border radius: 4px (sm), 6px (md/default), 8px (lg) — subtle, not pill-shaped
- Borders: 1px `--cold-silver` (#D0D3D8) for dividers; 1px slightly darker for inputs
- No heavy card borders — prefer very subtle shadows or just background color contrast

### Cards
- Background: white (`#FFFFFF`) on warm-white pages; dark (`#1C1F23`) on charcoal pages
- Shadow: `0 1px 3px rgba(0,0,0,0.08)` — extremely subtle, barely lifted
- Border: optional `1px solid #D0D3D8`
- Radius: 6px

### Shadows / Elevation
- Level 0: no shadow (flat, same-surface elements)
- Level 1: `0 1px 3px rgba(0,0,0,0.08)` — cards
- Level 2: `0 4px 12px rgba(0,0,0,0.12)` — dropdowns, modals
- No inner shadows. No multi-layer shadows.

### Animations
- Transitions: `150ms ease` for hover color/bg changes
- No bounce, no spring. Subtle and professional.
- No decorative animations. Purposeful only (loading states, etc.)

### Hover / Active States
- Buttons: darken background ~10%, no scale transform
- Nav links: background `rgba(255,255,255,0.06)` on dark sidebar; `#F0F0ED` on light
- No glow, no border-color change on hover

### Backgrounds
- No gradients. No textures. No patterns.
- Dark mode surfaces: layered darks — `#121417` base, `#1C1F23` cards, `#22262B` elevated
- Light mode surfaces: `#F5F5F2` page, `#FFFFFF` cards

### Imagery
- Video/filmmaking context: desaturated, high-contrast, cinematic stills
- No stock photography aesthetic — real production/BTS content
- B&W or very muted color treatment preferred

### Iconography
- Uses **Lucide React** (`lucide-react@0.451.0`) — thin stroke, 16×16 / 20×20
- Consistent `h-4 w-4` (16px) or `h-5 w-5` (20px) in UI contexts
- No emoji as icons. No custom SVG icons (use Lucide set)
- Specific icons in use: `Calendar`, `FileText`, `FolderOpen`, `Users` (sidebar nav)

### Kanban Column Colors (semantic)
| Stage | Color | Hex |
|---|---|---|
| Baby Idea | Warm Yellow | `#F5C842` |
| Guionizar | Coral Orange | `#E8845C` |
| Grabación | Mint Green | `#52B788` |
| Edición | Sky Blue | `#5B9BD5` |
| Publicado | Soft Purple | `#9B72CF` |

---

## ICONOGRAPHY

Novum uses **Lucide React** as the primary icon system (thin-stroke, geometric, clean). Available via CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`

Current usage in codebase:
- `Calendar` — Hub de Edición nav
- `FileText` — Guiones nav
- `FolderOpen` — Recursos nav
- `Users` — Clientes nav

Brand logo assets in `assets/`:
- `WORDMARK-10.svg` — primary wordmark (light version)
- `WORDMARK-11.svg` — alternate wordmark
- `WORDMARK-10-ALT.svg` — alternate
- `WORDMARK-TAGLINE-05.svg` — wordmark + tagline variant 1
- `WORDMARK-TAGLINE-06.svg` — wordmark + tagline variant 2
- `WORDMARK-TAGLINE-08.svg` — wordmark + tagline variant 3
- `ISOLOGO-15.svg` — isologo (icon mark) variant 1
- `ISOLOGO-16.svg` — isologo variant 2
- `ISOLOGO-18.svg` — isologo variant 3

---

## File Index

```
README.md                    ← This file
SKILL.md                     ← Agent skill definition
colors_and_type.css          ← CSS custom properties (tokens + semantic vars)
fonts/                       ← Local font files
  ARLON BLACK.ttf
  CENTURY GOTHIC_DELGADA.ttf
  CENTURY GOTHIC_GRUES.ttf
  CENTURY GOTHIC_REGULAR.ttf
  CENTURY GOTHIC_ULTRAGURESA.ttf
assets/                      ← Logos and brand assets
  WORDMARK-10.svg            ← Primary wordmark (recommended)
  WORDMARK-11.svg
  WORDMARK-TAGLINE-05/06/08.svg
  ISOLOGO-15/16/18.svg
preview/                     ← Design System tab cards
  colors-brand.html
  colors-semantic.html
  colors-kanban.html
  type-display.html
  type-body-scale.html
  type-specimens.html
  spacing-tokens.html
  radius-shadows.html
  components-buttons.html
  components-badges.html
  components-cards.html
  components-inputs.html
  components-nav.html
ui_kits/
  client-portal/             ← Client-facing UI kit
    index.html               ← Kanban (default view)
    README.md
  internal-dashboard/        ← Team dashboard UI kit
    index.html               ← Hub de Edición (default view)
    README.md
```
