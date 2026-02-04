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

This is an Indonesian Al-Quran digital application built with React 18 + TypeScript + Vite. It's a mobile-first PWA that provides comprehensive Islamic daily features including Quran reading with audio playback, prayer times, daily supplications (doa), Ramadan/fasting schedule (imsakiyah), and bookmarks.

### Data Flow

```
External APIs (Quran, Shalat, Doa, Imsakiyah)
  → services/
    → React Query (Server State)
      → pages/
        ← hooks/ (Local State & Geolocation)
```

- **Quran data**: eQuran.id API v2 (`https://equran.id/api/v2`)
- **Prayer times**: Same API (`/shalat` endpoints)
- **Doa (Supplications)**: eQuran.id API (`https://equran.id/api/doa`)
- **Imsakiyah (Fasting Schedule)**: eQuran.id API v2 (`/imsakiyah` endpoints, uses POST requests)
- **Local state**: `useLocalStorage` hook for bookmarks, settings, reading history

### Key Directories

- `src/services/` - API functions (quranApi, shalatApi, doaApi, imsakiyahApi)
- `src/hooks/` - State management hooks (useBookmarks, useSettings, useReadingHistory, useLocalStorage, useGeolocation)
- `src/pages/` - Route components (Index, SurahPage, ShalatPage, DoaPage, ImsakiyahPage, BookmarkPage, SettingsPage)
- `src/components/` - UI components; `ui/` subdirectory contains shadcn/ui components
- `src/types/` - TypeScript interfaces for API responses (quran, shalat, doa, imsakiyah)

### Features

- **Al-Quran**: Read surahs with Arabic text, transliteration, translation, and audio playback
- **Waktu Shalat**: Prayer times with city selection based on geolocation
- **Doa Harian**: Searchable list of daily prayers with Arabic text, transliteration, and translation
- **Imsakiyah**: Monthly Ramadan fasting schedule with province/city selection
- **Bookmarks**: Save favorite ayat for quick access
- **Settings**: Theme (light/dark), font size, display preferences

### State Management Pattern

No global state library. State is managed via:
1. **React Query** for server state (surah list, surah detail, tafsir, prayer times, doa, imsakiyah)
2. **Custom hooks with localStorage** for persistent client state:
   - `useSettings` - theme, font size, display preferences
   - `useBookmarks` - saved ayat references
   - `useReadingHistory` - recently read surahs
3. **Geolocation hook** for location-based features:
   - `useGeolocation` - browser location with Haversine distance calculation for nearest city

### Component Conventions

- Path alias: `@/` maps to `src/`
- Styling: Tailwind CSS with `cn()` utility for conditional classes
- UI primitives from shadcn/ui (Radix-based)
- Mobile-first responsive design (`sm:`, `md:` breakpoints)

### TypeScript Configuration

The project has relaxed TypeScript settings (`noImplicitAny: false`, `strictNullChecks: false`). When adding new code, follow existing patterns rather than adding strict types.

### Testing

Tests use Vitest with jsdom environment and React Testing Library. Test files go in `src/test/` or alongside source files with `.test.ts(x)` suffix.
