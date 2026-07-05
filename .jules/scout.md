## 2026-07-04 - Centralized State Management in QuestionCard

**Learning:** The previous implementation leaked UI state management (lock/collapse and time penalty calculation) into all 6 consumer components of `QuestionCard`. This repetitive pattern caused unnecessary boilerplate across the application.
**Action:** Always prefer to encapsulate shared UI state modifications (like toggling collapsed state or applying shared context effects like penalties) within the base component itself when the behaviour is uniform across all its consumers.

## 2026-07-04 - Centralized derived state in QuestionCard

**Learning:** The previous implementation leaked UI derived state management (question label calculation) into 5 of the 6 consumer components of `QuestionCard`. This repetitive pattern caused unnecessary boilerplate across the application.
**Action:** Always prefer to encapsulate shared UI state modifications (like computing default labels) within the base component itself when the base component already subscribes to the same state.

## 2024-05-18 - Playwright Verification Tips

**Learning:** Playwright strict visibility checks can sometimes block testing local interactions if elements are hidden by responsive UI or off-screen scroll bars.
**Action:** When writing temporary Playwright verification scripts in Python, use `page.evaluate()` to execute clicks via JavaScript (e.g., `element.click()`) to bypass strict Playwright visibility and clickability checks, especially for elements hidden inside responsive sidebars or off-screen panels.
