## 2025-02-27 - Icon-only buttons lacking ARIA labels

**Learning:** Found several native and custom `Button` icon-only buttons without `aria-label`s or semantic `type="button"` attributes. In an accessible UI, screen readers need descriptive text when content is purely visual or uses icons.
**Action:** Always verify icon-only buttons (`<button>`, `<Button>`) include a descriptive `aria-label` (and `aria-expanded` if functioning as a toggle) and ensure native buttons specify `type="button"` to avoid implicit form submission issues and improve accessibility across the app.

## 2026-06-23 - Icon-only buttons lacking ARIA labels

**Learning:** Found several native and custom `Button` icon-only buttons in `LatLngPicker.tsx` without `aria-label`s. While they had `title` attributes, assistive technologies like screen readers rely heavily on `aria-label` for accurate announcements of purely visual controls.
**Action:** Always verify icon-only buttons (`<button>`, `<Button>`) include a descriptive `aria-label` mirroring their visual intent or `title` attribute to ensure proper accessibility for screen readers across the app.

## 2024-06-24 - Map marker colour functionality

**Learning:** Integrating a colour selector directly into a commonly shared spatial UI component `LatitudeLongitude` effectively delegates styling logic from multiple question types while maintaining React unidirectional state flow via an `onChangeColor` callback prop. Overcomplicating Playwright UI verification tests with overly specific selectors on dynamic layouts can lead to failures when testing complex nested dialogues.

**Action:** Leveraged `LatitudeLongitude` to expose a colour-changing button for `ICON_COLORS` palette without rewriting boilerplate UI per question card type. Updated all question components (`radius.tsx`, `thermometer.tsx` (for A & B), `tentacles.tsx`, `measuring.tsx`, `matching.tsx`, `photo.tsx`) to pass an `onChangeColor` prop that mutates their local store state. Used pure JS evaluation `document.querySelectorAll('button')` based on title during Playwright testing to bypass obscure selector mismatches.

## 2025-02-23 - Added ARIA labels to DraggableMarkers and scroll-to-top buttons

**Learning:** Found and fixed unlabelled "Close panel" icon buttons in `DraggableMarkers.tsx` and an unlabelled "Scroll to top" button in `scroll-to-top.tsx`. It's common to miss aria-labels on utility overlay components like these.
**Action:** Next time I work on floating panels or sticky buttons, check for missing ARIA labels on the close/action triggers.

## 2024-06-29 - Close Icon SVGs lacking accessible `<button>` wrappers

**Learning:** Found instances where raw SVG icons (e.g., `SidebarCloseIcon` from `lucide-react`) were used directly as clickable interactive elements with `onClick` handlers but without semantic `<button>` wrappers. This prevents keyboard focus (Tab navigation) and lacks proper role and screen reader description (`aria-label`).
**Action:** Always ensure that purely visual SVG icons with click handlers are wrapped in a semantic `<button type="button">` element with appropriate hover/focus styles, keyboard focus indicators (`focus:ring`), and an `aria-label` to provide an accessible and robust interaction pattern.

## 2026-06-30 - Contextual ARIA labels and Focus Styles for List Items

**Learning:** Found an icon-only "Remove entry" button inside a mapped leaderboard list in `TimerDrawer.tsx` that lacked a contextual `aria-label` (making it unclear _which_ entry it removes for screen readers), a `type="button"` attribute, and proper `focus-visible` keyboard navigation styles. Static `title` attributes on repeated list item buttons are insufficient for accessibility.
**Action:** When adding or reviewing buttons inside mapped lists (like leaderboards or item rows), always ensure the `aria-label` includes contextual data (e.g., the item's name) and that the button has explicit `focus-visible` ring styles for keyboard navigation.

## 2026-07-01 - Added focus-visible and aria-labels to Sidebar Trigger Buttons

**Learning:** The `TbMessage2Question` and `LiaThumbtackSolid` sidebar trigger buttons inside `sidebar-l.tsx` and `sidebar-r.tsx` were missing `focus-visible` classes, `type="button"`, and `aria-label` attributes, which hurt keyboard navigation accessibility. Using standard `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` consistently makes the focus state predictable without custom CSS.
**Action:** Ensure custom Shadcn-style icon buttons have explicit aria-labels and use `focus-visible` utility classes for clear keyboard focus states.

## 2026-07-02 - Floating Map Controls Lacking Focus Styles

**Learning:** Found several native floating map controls (`LeafletActionButtons.tsx` and `TimerDrawer.tsx` triggers) and the `NextStepsChecklist.tsx` close button lacking keyboard `focus-visible` utility classes and/or `type="button"` declarations. While these elements functioned correctly for mouse users, they were completely invisible to keyboard navigation, failing WCAG standards.
**Action:** Always ensure that custom floating buttons and overlay close triggers have explicit `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2` utility classes to guarantee accessible keyboard navigation across all interactive layers.
