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
