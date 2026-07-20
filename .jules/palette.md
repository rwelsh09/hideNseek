## 2026-06-24 - [Map marker colour functionality]

**Learning:** Integrating a colour selector directly into a commonly shared spatial UI component `LatitudeLongitude` effectively delegates styling logic from multiple question types while maintaining React unidirectional state flow via an `onChangeColour` callback prop. Overcomplicating Playwright UI verification tests with overly specific selectors on dynamic layouts can lead to failures when testing complex nested dialogues.

**Action:** Leveraged `LatitudeLongitude` to expose a colour-changing button for `ICON_COLOURS` palette without rewriting boilerplate UI per question card type. Updated all question components (`radius.tsx`, `thermometer.tsx` (for A & B), `tentacles.tsx`, `measuring.tsx`, `matching.tsx`, `photo.tsx`) to pass an `onChangeColour` prop that mutates their local store state. Used pure JS evaluation `document.querySelectorAll('button')` based on title during Playwright testing to bypass obscure selector mismatches.

## 2026-07-15 - [Comprehensive Accessible Interactive Elements]

**Learning:** Across the application (e.g., `DraggableMarkers`, `SidebarCloseIcon`, `TimerDrawer` leaderboards, `sidebar-l`/`sidebar-r`, floating map controls, `LatLngPicker` hemispheres, `AddQuestionDialog` categories), purely visual SVGs or abbreviated text toggles were frequently implemented with `onClick` handlers but lacked fundamental accessibility markers. This prevented keyboard focus, blocked screen reader context (lacking semantic roles), or rendered elements completely invisible to keyboard navigation. Static `title` attributes alone on repeated list items or abbreviated texts are insufficient for robust accessibility.
**Action:** Always ensure that any interactive visual element or icon-only click target is wrapped in a semantic `<button type="button">` element. Critically, these elements must possess a descriptive, contextual `aria-label` (e.g., distinguishing _which_ list entry it removes), a native browser `title` for hover context, and explicit, consistent `focus-visible` utility classes (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2` or similar `ring-ring`) to guarantee predictable and accessible keyboard navigation patterns across all UI layers.

## 2026-07-28 - [Accessible Form Buttons inside Dynamic Grid Components]

**Learning:** When using dynamic map iteration to generate complex interactive elements (like the grid of location selection buttons in `MatchSection` and `MeasureSection`), standard `aria-label`s and `title`s are often overlooked in favor of purely visual rendering. This creates identical, unlabelled interaction targets for screen readers, masking the unique action each button performs.
**Action:** When rendering arrays of interactive components based on configuration data (such as `PLACES`), always inject the dynamically generated semantic descriptor (e.g., `place.label` or hardcoded label context) directly into `aria-label` and `title` attributes on every clickable item to provide clear, accessible, and distinct interactions for all users.

## 2026-08-01 - [Accessible Form Inputs in Complex Layouts]

**Learning:** When using standard UI components (like `Input` and `Label` from Radix UI or generic design systems) within complex nested layouts such as accordions (e.g., `AdvancedStationManagement`), the explicit association between a label and its input (`htmlFor` and `id`) is often overlooked. Without it, users clicking the label won't focus the input, and screen readers will fail to announce the context of the input field.
**Action:** Always ensure any `<Label>` is bound to its associated `<Input>` using matching `htmlFor` and `id` properties, especially in newly added settings or configuration panels, to guarantee robust keyboard accessibility and screen reader support.
