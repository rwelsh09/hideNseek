## 2026-06-18 - [Playwright Verification Tips]

**Learning:** Playwright strict visibility checks can sometimes block testing local interactions if elements are hidden by responsive UI or off-screen scroll bars.
**Action:** When writing temporary Playwright verification scripts in Python, use `page.evaluate()` to execute clicks via JavaScript (e.g., `element.click()`) to bypass strict Playwright visibility and clickability checks, especially for elements hidden inside responsive sidebars or off-screen panels.

## 2026-07-04 - [turf.difference Usage with FeatureCollections]

**Learning:** In the project's version of Turf.js (v7), functions like `turf.difference` accept a `FeatureCollection` directly. Passing the raw `.features` array instead will throw an 'Unknown Geometry Type' error.
**Action:** When performing operations on multiple features at once with Turf v7 (like `turf.difference`), wrap the elements in `turf.featureCollection([...])` rather than spreading them or attempting manual iteration.

## 2026-07-12 - [Zod internal options reflection]

**Learning:** We previously used manual reflection into Zod schema internals (`_def.innerType`, `_def.value`) within UI components (like `ClosestQuestionComponent` and `MatchQuestionComponent`) to extract Select options. This was brittle and led to leaky abstractions.
**Action:** Use the newly created `getSchemaOptions(schema)` function from `src/maps/schema.ts` when building options objects from Zod schema definitions to encapsulate all Zod internal traversals.

## 2026-07-13 - [Centralize State and Logic in QuestionCard]

**Learning:** Previously, state management (lock/collapse, penalties), derived state (`resultStr`, default labels), contextual display ("Tell the Seekers" `$hiderMode`), and question-specific actions (Rules, Share, Delete) were leaked into consumer components (like `closest`, `hot-cold`, etc.) or generic components (like `LatLngPicker`). This caused repetitive boilerplate and violated separation of concerns.
**Action:** Always prefer to encapsulate shared UI state modifications, derived logic, and specific actions within the base component itself (`QuestionCard`) when the behavior is uniform across all its consumers or relies on shared context.

## 2026-08-02 - [Registry Pattern for Map Questions]

**Learning:** The project previously relied on scattered `switch` and `if-else` statements across the codebase (e.g., `DraggableMarkers`, `hiding-zones.ts`, `question-text.ts`) to handle question-specific logic, which created a leaky abstraction and violated the Open-Closed Principle.
**Action:** The codebase uses a centralized Registry (Strategy) pattern to manage logic that varies by map question type. Use `QUESTION_HANDLERS` in `src/maps/index.ts` for geospatial logic, draft creation (`createDraft`), locked state checks (`isLocked`), hiding zone filtering (`filterHidingZones`), and UI visualizer configurations (like `getDraggablePoints`). Use `QUESTION_TEXT_HANDLERS` in `src/lib/question-text.ts` for text and UI label generation. Avoid scattered `switch` or `if/else` statements branching on `question.id`.

## 2026-08-04 - [Fix @arcgis/core/unionTypes module resolution]

**Learning:** In newer `@arcgis/core` versions, wildcard importing `unionTypes.js` for type references (`import * as unionTypes from "@arcgis/core/unionTypes.js"`) breaks Vite/esbuild module resolution at runtime, as the file doesn't exist to be loaded. It must be explicitly imported as a type (`import type { GeometryUnion } from "@arcgis/core/geometry/types.js"`).
**Action:** Always import types explicitly using `import type` to ensure the bundler strips them correctly and avoids runtime resolution errors for missing type files.
