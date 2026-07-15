## 2026-06-24 - Map marker colour functionality

**Learning:** Integrating a colour selector directly into a commonly shared spatial UI component `LatitudeLongitude` effectively delegates styling logic from multiple question types while maintaining React unidirectional state flow via an `onChangeColor` callback prop. Overcomplicating Playwright UI verification tests with overly specific selectors on dynamic layouts can lead to failures when testing complex nested dialogues.

**Action:** Leveraged `LatitudeLongitude` to expose a colour-changing button for `ICON_COLORS` palette without rewriting boilerplate UI per question card type. Updated all question components (`radius.tsx`, `thermometer.tsx` (for A & B), `tentacles.tsx`, `measuring.tsx`, `matching.tsx`, `photo.tsx`) to pass an `onChangeColor` prop that mutates their local store state. Used pure JS evaluation `document.querySelectorAll('button')` based on title during Playwright testing to bypass obscure selector mismatches.

## 2026-02-25 - Added ARIA labels to DraggableMarkers and scroll-to-top buttons

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

## 2026-07-03 - Hemisphere toggle buttons lacking explicit ARIA labels

**Learning:** Found small hemisphere toggle buttons ('N'/'S' and 'E'/'W') in `src/components/LatLngPicker.tsx` that lacked descriptive `aria-label`s and `title`s. Although they contain abbreviated text, their function (toggling the coordinate hemisphere) isn't explicitly clear to screen reader users from just the letters 'N', 'S', 'E', or 'W'. Providing a clear description of the action (e.g., "Toggle to South hemisphere") is much more accessible.
**Action:** When creating small toggle buttons with abbreviated text or purely visual symbols, always include a descriptive `aria-label` and `title` to clarify the button's purpose and state to assistive technologies.
## 2026-07-04 - Closest Category Buttons Lacking ARIA Labels

**Learning:** Found 8 small icon-only buttons in `AddQuestionDialog.tsx` representing different "Closest" question locations (Museum, Hospital, Cinema, etc.) that lacked descriptive `aria-label` and `title` attributes. Without these, assistive technologies would struggle to interpret the button's function, especially since the visible text is extremely small and occasionally truncated.
**Action:** When adding arrays or groups of visually similar icon buttons, verify each one possesses a distinct, descriptive `aria-label` and matching native browser `title` to ensure they are fully accessible and provide on-hover context.

## 2026-07-15 - Icon-only buttons lacking ARIA labels

**Learning:** This app's icon-only buttons sometimes lack ARIA labels which are critical for screen reader users.
**Action:** Always check icon-only buttons for `aria-label` attributes and add them when missing.
