## 2026-07-18 - [Unescaped Entities in JSX]

**Learning:** When making copy edits in React (JSX/TSX), standard quotes (") and apostrophes (') can cause ESLint errors (`react/no-unescaped-entities`).
**Action:** Always escape quotes and apostrophes in JSX string literals (e.g., use `&quot;` and `&apos;`) and verify with `npx eslint src` after making text changes.

## 2026-07-18 - [Brand Capitalization and Formatting Tooling]

**Learning:** This project strictly uses Title Case for game-specific terms like "Hiding Zone", "Head Start", and "Time Penalty". Additionally, running the global `pnpm lint` command acts as a formatter (`prettier --write`) which aggressively modifies untargeted files (like `package.json`).
**Action:** Capitalize game terms correctly across the codebase. When doing localized copy-editing, avoid running `pnpm lint` to prevent noisy, untargeted formatting diffs. Rely on `pnpm test` and targeted tools like `npx eslint src`.

## 2026-07-28 - [Consistency and Grammar Fixes]

**Learning:** Fixed grammar, spelling, and missing commas in tutorials and rule text. Maintained Canadian spellings (colour, neighbourhood). Discovered that Start as Seeker should be Start as a Seeker.
**Action:** Always verify if Canadian/British English spellings are correct based on the context before making changes. Avoid committing local development logs like pnpm_dev.log.

## 2026-07-28 - [Do not edit offline_places.json]

**Learning:** The file `src/data/offline_places.json` is automatically generated using data from OpenStreetMap. Typos found within this file must not be fixed locally, as they stem from the source data and will be overwritten.
**Action:** Never edit `src/data/offline_places.json` directly for copy-editing or typo fixes.

## 2026-07-28 - [Distance Unit Consistency]
**Learning:** The application uses metric units for distances. In user-facing UI text, use standard Canadian/British English spelling ("kilometres" and "metres") instead of the US spellings ("kilometers" and "meters").
**Action:** Replace instances of "meters" with "metres" and "kilometers" with "kilometres" in JSX templates, labels, and quiz descriptions. Be careful not to replace literal strings that form parts of object keys or schema logic unless explicitly instructed.
