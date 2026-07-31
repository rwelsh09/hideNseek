## 2026-06-18 - [Playwright Verification Tips]

**Learning:** Playwright strict visibility checks can sometimes block testing local interactions if elements are hidden by responsive UI or off-screen scroll bars.
**Action:** When writing temporary Playwright verification scripts in Python, use `page.evaluate()` to execute clicks via JavaScript (e.g., `element.click()`) to bypass strict Playwright visibility and clickability checks, especially for elements hidden inside responsive sidebars or off-screen panels.

## 2026-07-04 - [turf.difference Usage with FeatureCollections]

**Learning:** In the project's version of Turf.js (v7), functions like `turf.difference` accept a `FeatureCollection` directly. Passing the raw `.features` array instead will throw an 'Unknown Geometry Type' error.
**Action:** When performing operations on multiple features at once with Turf v7 (like `turf.difference`), wrap the elements in `turf.featureCollection([...])` rather than spreading them or attempting manual iteration.

## 2026-06-18 - [Zod internal options reflection]

**Learning:** We previously used manual reflection into Zod schema internals (`_def.innerType`, `_def.value`) within UI components (like `ClosestQuestionComponent` and `MatchQuestionComponent`) to extract Select options. This was brittle and led to leaky abstractions.
**Action:** Use the newly created `getSchemaOptions(schema)` function from `src/maps/schema.ts` when building options objects from Zod schema definitions to encapsulate all Zod internal traversals.

## 2026-07-13 - [Centralize State and Logic in QuestionCard]

**Learning:** Previously, state management (lock/collapse, penalties), derived state (`resultStr`, default labels), contextual display ("Tell the Seekers" `$hiderMode`), and question-specific actions (Rules, Share, Delete) were leaked into consumer components (like `closest`, `hot-cold`, etc.) or generic components (like `LatLngPicker`). This caused repetitive boilerplate and violated separation of concerns.
**Action:** Always prefer to encapsulate shared UI state modifications, derived logic, and specific actions within the base component itself (`QuestionCard`) when the behavior is uniform across all its consumers or relies on shared context.

## 2026-07-28 - [Registry Pattern for Map Questions]

**Learning:** The project previously relied on multiple parallel `switch` and `if-else` statements across different functions (e.g., in `src/maps/index.ts`, `base.tsx`, `question-text.ts`, `AddQuestionDialog.tsx`) to handle question-specific logic (dispatching, text handlers, state setup like `colour`, `radius`, `locked`), which violated the Open-Closed Principle and caused a leaky abstraction.
**Action:** The codebase uses a centralized Registry (Strategy) pattern to manage logic that varies by map question type. Use `QUESTION_HANDLERS` in `src/maps/index.ts` for geospatial logic, draft creation (`createDraft`), and locked state checks (`isLocked`). Use `QUESTION_TEXT_HANDLERS` in `src/lib/question-text.ts` for text and UI label generation. Avoid scattered `switch` or `if/else` statements branching on `question.id`.

## 2026-08-15 - [Refactor DraggableMarkers switch statement]

**Learning:** The `DraggableMarkers` component previously relied on a massive hardcoded `switch` statement over `question.id` to determine how many draggable points to render and what keys/colors they use. This created a leaky abstraction that forced the view layer to know intimate details about question properties (like `latA`/`lngA` for hot/cold questions) and required modifying this component every time a new map question was added, violating the Open-Closed Principle.
**Action:** Extend the existing registry pattern (`QUESTION_HANDLERS` in `src/maps/index.ts`) by introducing a `getDraggablePoints` interface. This allows each question handler to define its own logic for extracting coordinate and color metadata, completely isolating map-specific property knowledge from the UI.

## 2026-08-25 - [Filter Hiding Zones via Registry Pattern]

**Learning:** Previously, `initializeHidingZonesLogic` in `src/lib/hiding-zones.ts` contained a hardcoded, tightly coupled `if (question.id === "match")` block handling specific sub-types like `same-train-line`. This leaked domain logic (map questions) into an orthogonal subsystem (hiding zones) and violated the Open-Closed Principle, forcing modifications to unrelated files when adding new questions.
**Action:** Extended the central Registry Pattern (`QUESTION_HANDLERS` in `src/maps/index.ts`) with a `filterHidingZones` optional method. Now `hiding-zones.ts` delegates this filtering to the registry, completely decoupling hiding zones from specific question implementations.
## 2026-06-25 - Fix @arcgis/core/unionTypes module resolution
**Learning:** In newer `@arcgis/core` versions, wildcard importing `unionTypes.js` for type references (`import * as unionTypes from "@arcgis/core/unionTypes.js"`) breaks Vite/esbuild module resolution at runtime, as the file doesn't exist to be loaded. It must be explicitly imported as a type (`import type { GeometryUnion } from "@arcgis/core/geometry/types.js"`).
**Action:** Always import types explicitly using `import type` to ensure the bundler strips them correctly and avoids runtime resolution errors for missing type files.
