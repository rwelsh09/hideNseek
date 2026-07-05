## 2026-07-04 - Centralized State Management in QuestionCard

**Learning:** The previous implementation leaked UI state management (lock/collapse and time penalty calculation) into all 6 consumer components of `QuestionCard`. This repetitive pattern caused unnecessary boilerplate across the application.
**Action:** Always prefer to encapsulate shared UI state modifications (like toggling collapsed state or applying shared context effects like penalties) within the base component itself when the behaviour is uniform across all its consumers.

## 2026-07-04 - Centralized derived state in QuestionCard

**Learning:** The previous implementation leaked UI derived state management (question label calculation) into 5 of the 6 consumer components of `QuestionCard`. This repetitive pattern caused unnecessary boilerplate across the application.
**Action:** Always prefer to encapsulate shared UI state modifications (like computing default labels) within the base component itself when the base component already subscribes to the same state.
