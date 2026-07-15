## 2024-07-15 - Missing ARIA labels in common layouts
**Learning:** Found an accessibility issue pattern where common interactive layout elements like search inputs and icon-only buttons (like notifications) lack `aria-label`s, and their corresponding icons aren't marked as decorative.
**Action:** When working on navigation or layout elements, ensure to add descriptive `aria-label`s to inputs/buttons and `aria-hidden="true"` to purely decorative lucide-react icons to make them screen reader friendly.
