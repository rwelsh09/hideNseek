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
