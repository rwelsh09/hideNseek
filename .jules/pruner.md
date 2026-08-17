## 2026-07-15 - [Handle TypeScript and ESLint Environment Issues]

**Learning:** `npx eslint src` can safely identify unused variables, but it emits warnings about ESLint configuration (`Cannot find package '@eslint/js'`). It is best to fix installation via `pnpm install` first. Be aware that `npx tsc --noEmit` might throw many errors related to unresolved icons or external libraries that are irrelevant to the removed unused code. Focus strictly on whether the _removed code_ introduces _new_ TS errors.
**Action:** Always test if `npx tsc --noEmit` and `pnpm run test --run` pass despite existing environment issues, ensuring no _new_ regressions are introduced. Also note that some linting problems, such as unescaped quotes in `StartScreen.tsx`, are best ignored by Pruner to maintain the strict deletion-only policy.

## 2026-07-15 - [Verify Public API usage before sweeping]

**Learning:** Unused internal functions might still be exported, making them appear as orphaned exports. It's critical to verify if these are intended to be part of a public API or just legacy code.
**Action:** Always check usages before removal, and ensure exports are not actually public API before sweeping.

## 2026-07-16 - [Pruning Shared Constants]

**Learning:** Constants exported from shared files (like `src/maps/api/constants.ts`) might be heavily used throughout components. Even if a specific dependent function (like a Zod schema generator) is completely unused, the core constant cannot be fully removed from the codebase if other components rely on it.
**Action:** When pruning "dead" imports or constants in a Zod schema file, carefully check if the constant itself is a global definition used by other UI components before assuming it can be deleted project-wide.

## 2026-07-16 - [Unrelated Prettier formatting on pnpm lint]

**Learning:** Running `pnpm lint` in this project's configuration executes `eslint --fix src && prettier . --write`. This will automatically rewrite and stage unrelated files and lines of code across the whole repository, violating Pruner's strict deletion-only boundary.
**Action:** When pruning, verify changes using `npx eslint <target-file>` instead of `pnpm lint`, or use `git restore --staged` on unrelated files and `git restore -p` to specifically unstaged unrelated formatting changes within the target file before creating a commit.

## 2026-07-28 - [Unused QuestionCard exports]

**Learning:** `knip` reported `ClosestQuestionComponent` etc. as unused exports in `src/components/QuestionCards.tsx`. Looking at the code, they were indeed exported for no reason. I removed the export statements but kept the imports since they are used inside `QUESTION_COMPONENTS`. This didn't trigger any cascading unused import issues.
**Action:** Always carefully check if an export is really unused, and make sure that removing an export doesn't leave an unused import behind, unless the imported item is used in the same file.

## 2026-07-26 - [Safe Dependency Removal]

**Learning:** When removing a potentially unused `devDependency` (e.g., `workbox-window`), explicitly verify it's unused using tools like `grep` and ensure the full test suite (`pnpm test`) continues to pass. Wait for user confirmation before deleting dependencies, as they may be used in un-scanned builds. Furthermore, Astro's `vite-plugin-pwa` runtime relies on `workbox-window` during the production `astro build`, causing CI to fail if removed.
**Action:** Do not blindly delete `workbox-window`. If a `devDependency` is flagged as unused but seems related to a framework integration (like PWA), always verify it by running the production build (`pnpm run build`) in addition to unit tests before declaring it dead.

## 2026-07-28 - [Removing Internal Export Keywords]

**Learning:** `ts-prune` and `knip` correctly identify exported variables, types, interfaces, and functions (like `LeaderboardEntry`, `persistentJsonAtom` in `src/lib/context.ts`, `ShareDataOptions` in `src/lib/utils.ts`, `TYPE_MAPPINGS`, and `getPlaceLabel` in `src/lib/question-text.ts`) that are only ever used internally within the declaring file.
**Action:** Do not delete these functions, types, variables or interfaces. Instead, remove the `export` keyword to restrict their scope and minimize the public API surface safely.

## 2026-06-25 - [Import sorting plugin]

**Learning:** The project uses `eslint-plugin-simple-import-sort`. When modifying, splitting, or updating imports (such as un-nesting barrel file exports), always run `npx eslint src --fix` to auto-sort the dependencies and prevent pipeline linting failures.
**Action:** Run `npx eslint src --fix` after making any modifications to import statements in the codebase.

## 2026-06-25 - [Dead-code tool false positives with Astro]

**Learning:** Automated dead-code detection tools (like `ts-prune` and `knip`) can falsely flag components or scripts dynamically imported or used by Astro files (e.g., `src/pages/index.astro`, `src/layouts/Layout.astro`) because they miss `<script src=\"...\">` tags and dynamic layout imports (like `pwa.ts`, `IncomingQuestionHandler`, `SidebarProvider`).
**Action:** Always verify with `grep` if a file or export flagged as unused is actually imported inside an `.astro` or HTML file before pruning.

## 2026-06-25 - [Redundant Wrapper Functions]

**Learning:** When pruning, you might find redundant wrapper functions inside components (like `applyMask` in `src/components/ZoneSidebar.tsx`) that simply return their input and are completely unnecessary.
**Action:** Replace calls to the redundant wrapper function with the direct returned value and remove the wrapper function entirely, ensuring no unused parameters or variables are left behind.
