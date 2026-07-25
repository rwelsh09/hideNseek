## 2026-07-18 - [Unescaped Entities in JSX]

**Learning:** When making copy edits in React (JSX/TSX), standard quotes (") and apostrophes (') can cause ESLint errors (`react/no-unescaped-entities`).
**Action:** Always escape quotes and apostrophes in JSX string literals (e.g., use `&quot;` and `&apos;`) and verify with `npx eslint src` after making text changes.

## 2026-07-18 - [Brand Capitalization and Formatting Tooling]

**Learning:** This project strictly uses Title Case for game-specific terms like "Hiding Zone", "Head Start", and "Time Penalty". Additionally, running the global `pnpm lint` command acts as a formatter (`prettier --write`) which aggressively modifies untargeted files (like `package.json`).
**Action:** Capitalize game terms correctly across the codebase. When doing localized copy-editing, avoid running `pnpm lint` to prevent noisy, untargeted formatting diffs. Rely on `pnpm test` and targeted tools like `npx eslint src`.
