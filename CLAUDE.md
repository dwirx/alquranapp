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

This is an Indonesian Al-Quran digital application built with React 18 + TypeScript + Vite. It's a mobile-first PWA that provides comprehensive Islamic daily features including Quran reading with audio playback, prayer times, daily supplications (doa), Ramadan/fasting schedule (imsakiyah), AI chat assistant, and bookmarks.

### Data Flow

```
External APIs (Quran, Shalat, Doa, Imsakiyah, Vector Search, NVIDIA LLM)
  → services/
    → React Query (Server State)
      → pages/
        ← hooks/ (Local State & Geolocation)
```

- **Quran data**: eQuran.id API v2 (`https://equran.id/api/v2`)
- **Prayer times**: Same API (`/shalat` endpoints)
- **Doa (Supplications)**: eQuran.id API (`https://equran.id/api/doa`)
- **Imsakiyah (Fasting Schedule)**: eQuran.id API v2 (`/imsakiyah` endpoints, uses POST requests)
- **AI Chat Vector Search**: eQuran.id Vector API (`/api/vector`) for semantic Quran search
- **AI Chat LLM**: NVIDIA API with Kimi K2.5 model for conversational AI
- **Local state**: `useLocalStorage` hook for bookmarks, settings, reading history, chat history

### Key Directories

- `src/services/` - API functions (quranApi, shalatApi, doaApi, imsakiyahApi, vectorSearchApi, aiChatApi)
- `src/hooks/` - State management hooks (useBookmarks, useSettings, useReadingHistory, useLocalStorage, useGeolocation, useChatHistory)
- `src/pages/` - Route components (Index, SurahPage, ShalatPage, DoaPage, ImsakiyahPage, AiChatPage, BookmarkPage, SettingsPage)
- `src/components/` - UI components; `ui/` subdirectory contains shadcn/ui, `chat/` for AI chat components, `layout/` for responsive layout
- `src/types/` - TypeScript interfaces for API responses (quran, shalat, doa, imsakiyah, chat)
- `src/lib/` - Utility functions including quranParser for processing AI responses

### Features

- **Al-Quran**: Read surahs with Arabic text, transliteration, translation, and audio playback
- **AI Chat**: Ask questions about Al-Quran using natural language with semantic search and validated Quran citations
- **Waktu Shalat**: Prayer times with city selection based on geolocation
- **Doa Harian**: Searchable list of daily prayers with Arabic text, transliteration, and translation
- **Imsakiyah**: Monthly Ramadan fasting schedule with province/city selection
- **Bookmarks**: Save favorite ayat for quick access
- **Settings**: Theme (light/dark), font size, display preferences

### AI Chat Feature

The AI Chat uses a RAG (Retrieval-Augmented Generation) architecture:
1. **Vector Search**: User question → eQuran.id Vector API for semantic Quran search
2. **LLM Processing**: Context + question → NVIDIA Kimi K2.5 with streaming response
3. **Quran Validation**: Response → quran-validator npm package for citation accuracy
4. **UI Rendering**: Parse `<quran>` XML tags → QuranCard components with links to surahs

Environment variables (`.env`):
```
VITE_NVIDIA_API_KEY=your_nvidia_api_key
VITE_NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
```

### State Management Pattern

No global state library. State is managed via:
1. **React Query** for server state (surah list, surah detail, tafsir, prayer times, doa, imsakiyah)
2. **Custom hooks with localStorage** for persistent client state:
   - `useSettings` - theme, font size, display preferences
   - `useBookmarks` - saved ayat references
   - `useReadingHistory` - recently read surahs
   - `useChatHistory` - AI chat sessions and messages
   - `useSidebarState` - sidebar collapsed/expanded state
3. **Geolocation hook** for location-based features:
   - `useGeolocation` - browser location with Haversine distance calculation for nearest city

### Responsive Layout

The app uses a custom responsive layout system with 3 breakpoints:
- **Mobile** (< 768px): Bottom navigation, full-width content
- **Tablet** (768-1024px): Adjusted spacing, optimized grids
- **Desktop** (≥ 1024px): Collapsible sidebar (240px ↔ 64px), multi-column layouts

Key layout components in `src/components/layout/`:
- `ResponsiveLayout` - Main layout wrapper
- `AppSidebar` - Desktop sidebar navigation
- `MasterDetailLayout` - Split view pattern

### Component Conventions

- Path alias: `@/` maps to `src/`
- Styling: Tailwind CSS with `cn()` utility for conditional classes
- UI primitives from shadcn/ui (Radix-based)
- Mobile-first responsive design (`sm:`, `md:`, `lg:` breakpoints)

### TypeScript Configuration

The project has relaxed TypeScript settings (`noImplicitAny: false`, `strictNullChecks: false`). When adding new code, follow existing patterns rather than adding strict types.

### Testing

Tests use Vitest with jsdom environment and React Testing Library. Test files go in `src/test/` or alongside source files with `.test.ts(x)` suffix.

### Dependencies

Key external packages:
- `quran-validator` - Validates and auto-corrects Quran citations in LLM responses
- `@tanstack/react-query` - Server state management
- `lucide-react` - Icon library
- `sonner` - Toast notifications
