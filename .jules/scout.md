## 2026-07-04 - Centralized State Management in QuestionCard

**Learning:** The previous implementation leaked UI state management (lock/collapse and time penalty calculation) into all 6 consumer components of `QuestionCard`. This repetitive pattern caused unnecessary boilerplate across the application.
**Action:** Always prefer to encapsulate shared UI state modifications (like toggling collapsed state or applying shared context effects like penalties) within the base component itself when the behaviour is uniform across all its consumers.

## 2026-07-04 - Centralized derived state in QuestionCard

**Learning:** The previous implementation leaked UI derived state management (question label calculation) into 5 of the 6 consumer components of `QuestionCard`. This repetitive pattern caused unnecessary boilerplate across the application.
**Action:** Always prefer to encapsulate shared UI state modifications (like computing default labels) within the base component itself when the base component already subscribes to the same state.

## 2024-05-18 - Playwright Verification Tips

**Learning:** Playwright strict visibility checks can sometimes block testing local interactions if elements are hidden by responsive UI or off-screen scroll bars.
**Action:** When writing temporary Playwright verification scripts in Python, use `page.evaluate()` to execute clicks via JavaScript (e.g., `element.click()`) to bypass strict Playwright visibility and clickability checks, especially for elements hidden inside responsive sidebars or off-screen panels.
## 2026-07-04 - turf.difference Usage with FeatureCollections
**Learning:** In the project's version of Turf.js (v7), functions like `turf.difference` accept a `FeatureCollection` directly. Passing the raw `.features` array instead will throw an 'Unknown Geometry Type' error.
**Action:** When performing operations on multiple features at once with Turf v7 (like `turf.difference`), wrap the elements in `turf.featureCollection([...])` rather than spreading them or attempting manual iteration.

## 2026-07-04 - Simplifying Geospatial Inversions
**Learning:** The codebase contained a complex workaround for geospatial subtraction (`modifyMapData`), which calculated a global inverse mask (`holedMask` subtracted from a worldwide `BLANK_GEOJSON`) and then used `turf.intersect`. This is mathematically equivalent to simply subtracting the shape using `turf.difference`, which is more resilient and cleaner to reason about.
**Action:** For geospatial subtraction (e.g., removing a shape from the map data), use `turf.difference` directly rather than calculating an inverse global mask (`holedMask` against `BLANK_GEOJSON`) and intersecting it, to avoid unnecessary complexity and potential geographic rounding errors.
