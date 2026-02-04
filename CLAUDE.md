# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Development
npm run dev        # Start dev server on port 8080

# Building
npm run build      # Production build
npm run build:dev  # Development build
npm run preview    # Preview production build

# Testing
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode (vitest)

# Linting
npm run lint       # ESLint with typescript-eslint
```

## Architecture Overview

This is an Indonesian Al-Quran digital application built with React 18 + TypeScript + Vite. It's a mobile-first PWA for reading Quran with audio playback, prayer times, and bookmarks.

### Data Flow

```
External APIs → services/ → React Query → pages/components → localStorage (persistence)
```

- **Quran data**: eQuran.id API v2 (`https://equran.id/api/v2`)
- **Prayer times**: Same API (`/shalat` endpoints)
- **Local state**: `useLocalStorage` hook for bookmarks, settings, reading history

### Key Directories

- `src/services/` - API functions for Quran and prayer times
- `src/hooks/` - State management hooks (useBookmarks, useSettings, useReadingHistory, useLocalStorage)
- `src/pages/` - Route components (Index, SurahPage, ShalatPage, BookmarkPage, SettingsPage)
- `src/components/` - UI components; `ui/` subdirectory contains shadcn/ui components
- `src/types/` - TypeScript interfaces for API responses

### State Management Pattern

No global state library. State is managed via:
1. **React Query** for server state (surah list, surah detail, tafsir, prayer times)
2. **Custom hooks with localStorage** for persistent client state:
   - `useSettings` - theme, font size, display preferences
   - `useBookmarks` - saved ayat references
   - `useReadingHistory` - recently read surahs

### Component Conventions

- Path alias: `@/` maps to `src/`
- Styling: Tailwind CSS with `cn()` utility for conditional classes
- UI primitives from shadcn/ui (Radix-based)
- Mobile-first responsive design (`sm:`, `md:` breakpoints)

### TypeScript Configuration

The project has relaxed TypeScript settings (`noImplicitAny: false`, `strictNullChecks: false`). When adding new code, follow existing patterns rather than adding strict types.

### Testing

Tests use Vitest with jsdom environment and React Testing Library. Test files go in `src/test/` or alongside source files with `.test.ts(x)` suffix.
