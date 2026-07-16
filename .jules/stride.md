## 2026-07-15 - [Mobile inputs and viewport optimizations]

**Learning:** The previous implementation used standard HTML inputs and default viewport meta tags which resulted in suboptimal mobile user experience, such as small alphanumeric keyboards for number fields, text inflation zooming, and browser pull-to-refresh interfering with game actions.
**Action:** Modified globals.css to disable pull-to-refresh with `overscroll-behavior: none` and `-webkit-tap-highlight-color: transparent`, added `inputMode="decimal"` to type="number" inputs to trigger the larger native numeric keypad, and restricted viewport zooming via the meta tag to fix these mobile friction points.

## 2026-07-28 - [Mobile Tap Targets and Feedback]
**Learning:** Native mobile apps use larger tap targets and tactile feedback, whereas typical web components often rely on hover states and smaller dimensions that cause mis-clicks when the user is walking or one-handed. Small leaflet map controls (34x34px) are a primary cause of this friction on mobile.
**Action:** Always ensure critical map controls and interactive overlay triggers are at least 44x44px on mobile devices, even if they scale down to 34x34px on desktop. Implement tactile touch feedback using Tailwind's `active:` pseudo-class (e.g. `active:bg-slate-200`) instead of relying solely on `hover:`.
