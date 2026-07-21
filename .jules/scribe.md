## 2024-05-18 - Unescaped Entities in JSX

**Learning:** When making copy edits in React (JSX/TSX), standard quotes (") and apostrophes (') can cause ESLint errors (`react/no-unescaped-entities`).
**Action:** Always escape quotes and apostrophes in JSX string literals (e.g., use `&quot;` and `&apos;`) and verify with `npx eslint src` after making text changes.
