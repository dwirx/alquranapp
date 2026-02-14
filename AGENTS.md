# Repository Guidelines

## Project Structure & Module Organization
This project is a Vite + React + TypeScript app.
- `src/pages`: route-level screens.
- `src/components`: shared UI and feature components (`ui/`, `layout/`, `chat/`).
- `src/services`: API/data access logic.
- `src/hooks`, `src/contexts`, `src/lib`, `src/types`: reusable app logic and typing utilities.
- `src/data`: static/local data sources.
- `src/test`: test files.
- `public/`: static assets served as-is.
- `dist/`: production build output (generated, do not edit).

Use the `@/*` import alias for internal modules (example: `@/components/ui/button`).

## Build, Test, and Development Commands
- `npm run dev`: start local dev server.
- `npm run build`: create production bundle in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint for `ts/tsx` files.
- `npm run test`: run Vitest once.
- `npm run test:watch`: run Vitest in watch mode.

`bun` commands are also documented, but use `npm` in CI-facing docs unless a task explicitly targets Bun.

## Coding Style & Naming Conventions
- Language: TypeScript + React function components.
- Indentation: 2 spaces; keep imports grouped and minimal.
- Components/pages: `PascalCase` file names (example: `QuranCard.tsx`).
- Hooks: `useXxx` naming in `src/hooks`.
- Utilities/constants: `camelCase` exports; prefer small, focused modules.
- Linting: follow `eslint.config.js` (`react-hooks` and `react-refresh` rules enabled).

## Testing Guidelines
- Frameworks: Vitest + React Testing Library + jsdom.
- Location: keep tests in `src/test` or colocated when needed.
- Naming: `*.test.ts` or `*.test.tsx`.
- Focus tests on user-visible behavior and service logic; avoid brittle implementation-detail assertions.
- Run `npm run test` and `npm run lint` before opening a PR.

## Commit & Pull Request Guidelines
Git history follows Conventional Commit style:
- `feat: ...`
- `fix: ...`
- `docs: ...`

PRs should include:
- Clear summary of user-facing and technical changes.
- Linked issue/task reference when available.
- Screenshots/GIFs for UI updates (desktop/mobile if layout changes).
- Notes on test coverage or manual verification steps.

## Security & Configuration Tips
- Copy `.env.example` to `.env` for local setup.
- Never commit secrets or real API keys.
- Validate new env vars in app startup/docs before merging.
