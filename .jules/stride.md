## 2026-07-15 - [Mobile inputs and viewport optimizations]

**Learning:** The previous implementation used standard HTML inputs and default viewport meta tags which resulted in suboptimal mobile user experience, such as small alphanumeric keyboards for number fields, text inflation zooming, and browser pull-to-refresh interfering with game actions.
**Action:** Modified globals.css to disable pull-to-refresh with `overscroll-behavior: none` and `-webkit-tap-highlight-color: transparent`, added `inputMode="decimal"` to type="number" inputs to trigger the larger native numeric keypad, and restricted viewport zooming via the meta tag to fix these mobile friction points.

## 2026-07-16 - [Mobile Tap Targets Rejected]

**Learning:** Attempted to increase critical map controls and interactive overlay triggers to a minimum of 44x44px on mobile devices. This mobile UI change was rejected by the owner after review.
**Action:** Do not increase all map control/sidebar trigger tap targets to 44x44px.

## 2026-07-17 - [Mobile Tap Target Feedback Rejected]

**Learning:** Attempted to apply `active:scale-95 transition-all` classes on critical buttons to provide immediate tactile visual feedback on touch devices. This mobile UI change was rejected by the owner after review.
**Action:** Do not apply `active:scale-95 transition-all` classes.

## 2026-07-18 - [Mobile GPS Options and Keyboard Hints]

**Learning:** `navigator.geolocation.getCurrentPosition` without `{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }` can result in inaccurate locations or silent failures outdoors. Adding these options improves accuracy and reliability for on-the-go users. Additionally, HTML `<Input />` elements for names or text that do not use `enterKeyHint="send"` and auto-correct disable properties provide terrible mobile keyboard UX, as the user battles their own phones spellchecker in a fast paced game.
**Action:** Used `useState` to introduce an `isLocating` flag for a better loading state when tapping the "Focus on your location" button. Add `autoCapitalize="words"`, `autoComplete="off"`, `autoCorrect="off"`, `spellCheck={false}`, and `enterKeyHint="send"` to standard text inputs where auto-correct gets in the way of fast-paced game typing.

## 2026-07-20 - [Mobile Keyboard Dismissal on Standalone Inputs]

**Learning:** Standalone HTML `<Input>` elements that are not part of a formal `<form>` do not naturally dismiss the mobile virtual keyboard when the user presses "Enter" or "Done". This leaves the screen obscured. Also, applying strict disabling attributes like `autoCorrect="off"` and `spellCheck={false}` to free-form notes fields degrades UX, as users expect those tools when writing notes.
**Action:** For standalone configuration inputs, add `enterKeyHint="done"` and an `onKeyDown` handler to call `e.currentTarget.blur()` if `e.key === "Enter"`. This dismisses the keyboard and correctly fires any associated `onBlur` save actions. Avoid disabling spellcheck on free-text note fields.
