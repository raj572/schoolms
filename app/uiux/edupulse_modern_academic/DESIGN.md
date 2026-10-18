---
name: EduPulse Modern Academic
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#5b598c'
  on-secondary: '#ffffff'
  secondary-container: '#c7c3fe'
  on-secondary-container: '#514f81'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c4c1fb'
  on-secondary-fixed: '#181445'
  on-secondary-fixed-variant: '#444173'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  data-tabular-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
  data-tabular-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system is engineered for parents, educators, students, and administrators within a modern K-12 and academy setting. The interface balances institutional authority with welcoming accessibility—bridging the gap between serious academic tracking and encouraging daily interaction.

The design movement combines **Contemporary Modern UI** with **Tactile Soft Surfaces**:
- **Tone:** Authoritative yet supportive, encouraging, legible, and organized.
- **Visual Weight:** Light and expansive canvas setups paired with crisp, high-contrast typography and intentional primary accents.
- **Emotion:** Trust, clarity, momentum, and academic pride. Surfaces feel dependable and clean, avoiding clinical detachment through warm slate neutrals and energetic primary blues.

## Colors

The palette establishes an immediate academic hierarchy through deep collegiate tones anchored by vibrant digital blues:

- **Primary (`#2563EB`):** Vibrant Royal Blue used for active states, key interactive CTAs, step progress indicators, and primary navigation elements.
- **Secondary (`#1E1B4B`):** Deep Collegiate Indigo/Navy dedicated to high-level headers, institutional badging, and authoritative structural framing.
- **Tertiary / Success (`#10B981`):** Soft Emerald Accent indicating positive attendance, grade improvements, verified homework submissions, and fee clearances.
- **Warning / Alert (`#F59E0B`):** Warm Amber applied to impending deadlines, missing assignments, detention or behavior notices, and pending approvals.
- **Canvas & Surfaces:** Primary backgrounds utilize soft slate (`#F8FAFC`), secondary groupings utilize cooler slate (`#F1F5F9`), while interactive and focus cards rest on pure white (`#FFFFFF`) with delicate structural borders (`#E2E8F0`).
- **Text Hierarchy:** Slate 900 (`#0F172A`) delivers high-contrast legibility for titles and grades, Slate 600 (`#475569`) manages secondary context and labels, and Slate 400 (`#94A3B8`) handles disabled or placeholder metadata.

## Typography

Plus Jakarta Sans is designated across all roles to achieve a warm, highly legible, geometric clarity that retains authority in numbers and tables.

- **Tabular Figures:** All numeric displays (grade percentages, GPA indicators, schedule time slots, tuition amounts) enforce `'tnum'` and `'lnum'` OpenType features to preserve clean vertical alignment in multi-row summaries.
- **Hierarchy Enforcers:** Display titles use heavy weights (700/800) with subtle negative letter spacing to give titles an editorial polish. Body text relies strictly on standard spacing for rapid scanning on mobile viewports.
- **Micro-Copy:** Status badges and auxiliary dates use uppercase or title-case `label-sm` with widened tracking (+0.04em) for legibility against pastel pill fills.

## Layout & Spacing

The layout is built upon an 8pt spatial grid with a fluid mobile container approach:

- **Touch Bounds:** All interactive elements maintain a strict minimum bounding box of 44px × 44px (with visual elements able to sit within that hit space).
- **Mobile Margins:** Standard horizontal margins are `1rem` (16px) on compact handheld viewports (< 480px) and expand to `1.5rem` (24px) for small tablets and foldables.
- **Card Clustering:** Inner card padding defaults to `space-md` (16px) for standard widgets, stepping down to `space-sm` (8px) for tightly grouped agenda feeds and tabular rows.
- **Vertical Rhythm:** Screen-level stacked cards and module groupings maintain a uniform separation of `space-md` (16px) or `space-lg` (24px) for distinct operational groups (e.g., Attendance vs. Next Assignment).

## Elevation & Depth

Visual separation relies on clean surface layering paired with ultra-diffused, ambient drop shadows rather than heavy structural borders:

- **Level 0 (Canvas):** Soft slate (`#F8FAFC`), entirely flat.
- **Level 1 (Default Cards, Timeline Tiles):** Pure white (`#FFFFFF`) with a 1px border (`#E2E8F0`) and an ambient shadow: `0 1px 3px 0 rgba(30, 41, 59, 0.04), 0 1px 2px -1px rgba(30, 41, 59, 0.02)`.
- **Level 2 (Active Cards, Quick Action Tiles):** White surface with ambient elevation: `0 4px 6px -1px rgba(30, 41, 59, 0.07), 0 2px 4px -2px rgba(30, 41, 59, 0.04)`.
- **Level 3 (Floating Controls, Sticky Bottom Navigation, Modals):** White surface lifted with a soft directional glow: `0 10px 15px -3px rgba(30, 41, 59, 0.08), 0 4px 6px -4px rgba(30, 41, 59, 0.03)`.

## Shapes

The design system employs a **Rounded** shape model:

- Standard input fields, cards, and modal sheets carry an 8px (`0.5rem`) base corner radius (`rounded-md`).
- Primary dashboards and hero cards adopt a 16px (`1rem`) radius (`rounded-lg`) to soften modular interfaces.
- Filter chips, status tags, pill counters, and floating bottom actions break from the base curvature and use full pill radii (`rounded-full` / 9999px) to signal micro-interactivity and friendly status metrics.

## Components

### Buttons
- **Primary:** Solid `#2563EB` fill, white text, 48px height, 12px horizontal padding, subtle elevation on press.
- **Secondary / Collegiate:** Solid `#1E1B4B` fill with crisp white text, used for high-level academic administrative actions (e.g., "Submit Term Report").
- **Subtle / Neutral:** `#F1F5F9` background, `#0F172A` text, hover/press state `#E2E8F0`.
- **Destructive:** Light rose tint (`#FEF2F2`) background with bold red (`#DC2626`) text.

### Badges & Pill Chips
- **Attendance / Success:** Pill shape, background `#ECFDF5`, text `#065F46`, paired with an optional 6px green indicator dot.
- **Urgent / Warning:** Pill shape, background `#FFFBEB`, text `#92400E`.
- **Academic Subject Tags:** Pill shape, background `#EFF6FF`, text `#1E40AF`.

### Metric Progress Rings & Circular Indicators
- Rendered using an SVG circle with stroke-dasharray transitions.
- Background track: `#E2E8F0` at 6px stroke width.
- Progress track: `#2563EB` or `#10B981` with rounded caps (`stroke-linecap: round`).
- Center value uses `data-tabular-lg` typography alongside a light `label-sm` caption beneath.

### Segmented Controls
- Contained in an encapsulated `#F1F5F9` track with 6px internal padding.
- Selected segment: Pure white card with Level 1 ambient shadow, 100% border radius matching segment constraints, text colored in `#0F172A` with weight 600.
- Unselected segments: Transparent fill, text colored in `#64748B`.

### Lists & Schedule Timelines
- Items display alternating left-edge color-coded accent bars (3px wide) representing subject matter or status.
- Timestamps and grade marks adopt tabular typography (`data-tabular-md`) for effortless scanning down the column.
- Tap feedback utilizes `#F8FAFC` highlighting.

### Form Inputs & Checkboxes
- **Inputs:** 48px standard touch target height, `#FFFFFF` fill, 1px `#CBD5E1` border, 8px radius. Focused state applies a 2px `#2563EB` ring with zero shadow offset.
- **Checkboxes & Radios:** 20px physical size centered within a 44px tap zone. Checked fill `#2563EB` with pure white iconography.