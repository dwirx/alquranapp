# AI Chat Responsive Polish Design

## Goals
Polish the AI Chat interface so it feels consistent and comfortable on both mobile and desktop without changing existing feature flow. Prioritize readability, spacing rhythm, touch ergonomics, and stable interaction states.

## Scope
- Keep current architecture (`AiChatPage` + `ChatContainer` + existing chat subcomponents).
- Improve layout behavior and visual hierarchy only.
- Keep free/$0 model filtering intact.

## UX Decisions
- Use responsive header heights and spacing (`h-14` mobile, `h-16` desktop) to reduce crowding.
- Keep model selection always discoverable in sticky chat header.
- Keep input docked at bottom with safe-area bottom padding for mobile devices.
- Use bounded message width to improve reading comfort on desktop while preserving compact mobile bubbles.
- Improve session list tap targets and visual clarity for mobile sheet and desktop sidebar.

## Interaction Design
- Show compact inline status badge for `searching`, `thinking`, and `generating` states.
- Preserve existing retry/stop controls; make stop CTA compact on mobile.
- Keep toast usage, but avoid unnecessary extra state transitions.

## Risk Controls
- Avoid broad refactor; only className/layout-level adjustments plus minimal status UI.
- Keep existing data and chat flow untouched.

## Verification Plan
- Run targeted tests and full suite (`npm run test`).
- Run lint (`npm run lint`) and confirm no new errors.
- Manually verify key breakpoints: mobile (<640), tablet, desktop (>=1024).
