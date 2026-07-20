## 2026-07-15 - [Handle TypeScript and ESLint Environment Issues]

**Learning:** `npx eslint src` can safely identify unused variables, but it emits warnings about ESLint configuration (`Cannot find package '@eslint/js'`). It is best to fix installation via `pnpm install` first. Be aware that `npx tsc --noEmit` might throw many errors related to unresolved icons or external libraries that are irrelevant to the removed unused code. Focus strictly on whether the *removed code* introduces *new* TS errors.
**Action:** Always test if `npx tsc --noEmit` and `pnpm run test --run` pass despite existing environment issues, ensuring no *new* regressions are introduced. Also note that some linting problems, such as unescaped quotes in `StartScreen.tsx`, are best ignored by Pruner to maintain the strict deletion-only policy.

## 2026-07-15 - [Removed nearestToQuestion]

**Learning:** Successfully removed `nearestToQuestion` from `src/maps/api/places.ts`. It was totally unused and an orphaned export.
**Action:** Always check usages before removal, and ensure exports are not actually public API before sweeping.

## 2026-07-16 - Pruning ICON_COLOURS

**Learning:** `ICON_COLOURS` is exported from `src/maps/api/constants.ts` and heavily used throughout components (e.g. `DraggableMarkers.tsx`, `LatLngPicker.tsx`) to reference color hexes, so it cannot be fully removed from the codebase. However, `randomColour` in `src/maps/schema.ts` which relied on it was completely unused (since Zod schema extension overrides `.default` values, the default generator was never called).
**Action:** When pruning "dead" imports or constants in a Zod schema file, carefully check if the constant itself is a global definition used by other UI components before assuming it can be deleted project-wide.

## 2026-07-16 - Unrelated Prettier formatting on pnpm lint
**Learning:** Running `pnpm lint` in this project's configuration executes `eslint --fix src && prettier . --write`. This will automatically rewrite and stage unrelated files and lines of code across the whole repository, violating Pruner's strict deletion-only boundary.
**Action:** When pruning, verify changes using `npx eslint <target-file>` instead of `pnpm lint`, or use `git restore --staged` on unrelated files and `git restore -p` to specifically unstaged unrelated formatting changes within the target file before creating a commit.

## 2026-07-17 - [pwa.ts knip flag]

**Learning:** `knip` will falsely flag `src/pwa.ts` as an unused file because it is explicitly included in `src/layouts/Layout.astro` via a `<script src="/src/pwa.ts"></script>` tag, which knip's static analysis misses.
**Action:** Always verify if a script file reported as unused by knip is actually loaded in an Astro layout or HTML template before deleting it.
## 2026-07-17 - [persistentJsonAtom Export]

**Learning:** `knip` will flag `persistentJsonAtom` in `src/lib/context.ts` as an unused export. However, the function is used internally within that file.
**Action:** When pruning "dead" exports, if the export is still used within the file, restrict its scope by simply removing the `export` keyword rather than deleting the function entirely, and ensure it is not used elsewhere in the project before doing so.
