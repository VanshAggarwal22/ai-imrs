## 2026-07-21 - Icon-Only Buttons Missing Accessible Names
**Learning:** The app frequently uses bare `<button>` elements containing only an icon (e.g., Lucide React icons like `<X>` or `<Send>`) without any text content or `aria-label`. This makes these interactive elements completely invisible or confusing to screen reader users, who hear only 'button' with no context.
**Action:** Always ensure that any button without visible text content has an `aria-label` attribute describing its function.
