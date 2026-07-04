## 2026-07-04 - Centralized State Management in QuestionCard
**Learning:** The previous implementation leaked UI state management (lock/collapse and time penalty calculation) into all 6 consumer components of `QuestionCard`. This repetitive pattern caused unnecessary boilerplate across the application.
**Action:** Always prefer to encapsulate shared UI state modifications (like toggling collapsed state or applying shared context effects like penalties) within the base component itself when the behaviour is uniform across all its consumers.
