## 2026-07-15 - [Mobile inputs and viewport optimizations]

**Learning:** The previous implementation used standard HTML inputs and default viewport meta tags which resulted in suboptimal mobile user experience, such as small alphanumeric keyboards for number fields, text inflation zooming, and browser pull-to-refresh interfering with game actions.
**Action:** Modified globals.css to disable pull-to-refresh with `overscroll-behavior: none` and `-webkit-tap-highlight-color: transparent`, added `inputMode="decimal"` to type="number" inputs to trigger the larger native numeric keypad, and restricted viewport zooming via the meta tag to fix these mobile friction points.

## 2026-07-16 - [Mobile Tap Targets Rejected]

**Learning:** Attempted to increase critical map controls and interactive overlay triggers to a minimum of 44x44px on mobile devices. This mobile UI change was rejected by the owner after review.
**Action:** Do not blindly increase all map control/sidebar trigger tap targets to 44x44px without further context on the preferred design system or specific usability tests.
