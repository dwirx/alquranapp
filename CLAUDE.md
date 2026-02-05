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

This is an Indonesian Al-Quran digital application built with React 18 + TypeScript + Vite. It's a mobile-first PWA that provides comprehensive Islamic daily features including Quran reading with audio playback, prayer times, daily supplications (doa), Ramadan/fasting schedule (imsakiyah), AI chat assistant (Ustadz AI), and bookmarks.

### Data Flow

```
External APIs (Quran, Shalat, Doa, Imsakiyah, Vector Search, OpenRouter)
  → services/
    → React Query (Server State) / ChatContext (Chat State)
      → pages/
        ← hooks/ (Local State & Geolocation)
          ← IndexedDB / localStorage (Persistence)
```

- **Quran data**: eQuran.id API v2 (`https://equran.id/api/v2`)
- **Prayer times**: Same API (`/shalat` endpoints)
- **Doa (Supplications)**: eQuran.id API (`https://equran.id/api/doa`)
- **Imsakiyah (Fasting Schedule)**: eQuran.id API v2 (`/imsakiyah` endpoints, uses POST requests)
- **AI Chat Vector Search**: eQuran.id Vector API (`/api/vector`) for semantic Quran search
- **AI Chat LLM**: OpenRouter API with 100+ models (streaming support)
- **Local persistence**: IndexedDB for chat sessions/models, localStorage for settings/bookmarks

### Key Directories

- `src/services/` - API functions (quranApi, shalatApi, doaApi, imsakiyahApi, vectorSearchApi, aiChatApi, openRouterApi)
- `src/hooks/` - State management hooks (useBookmarks, useSettings, useReadingHistory, useLocalStorage, useGeolocation, useChatDB, useModels)
- `src/contexts/` - React Contexts (ChatContext for shared chat state)
- `src/pages/` - Route components (Index, SurahPage, ShalatPage, DoaPage, ImsakiyahPage, AiChatPage, BookmarkPage, SettingsPage)
- `src/components/` - UI components; `ui/` subdirectory contains shadcn/ui, `chat/` for AI chat components, `layout/` for responsive layout
- `src/types/` - TypeScript interfaces for API responses (quran, shalat, doa, imsakiyah, chat)
- `src/lib/` - Utility functions including chatDB (IndexedDB operations) and quranParser

### Features

- **Al-Quran**: Read surahs with Arabic text, transliteration, translation, and audio playback. Supports direct navigation to specific ayat via URL hash with highlight effect.
- **AI Chat (Ustadz AI)**: Ask questions about Islam using natural language. Uses RAG with semantic search and precise Quran citations. Supports 100+ models from OpenRouter with filtering/sorting.
- **Waktu Shalat**: Prayer times with city selection based on geolocation
- **Doa Harian**: Searchable list of daily prayers with Arabic text, transliteration, and translation
- **Imsakiyah**: Monthly Ramadan fasting schedule with province/city selection
- **Bookmarks**: Save favorite ayat for quick access
- **Settings**: Theme (light/dark), font size, display preferences

### AI Chat Feature

The AI Chat uses a RAG (Retrieval-Augmented Generation) architecture:

1. **Vector Search**: User question → eQuran.id Vector API for semantic Quran search
2. **LLM Processing**: Context + question → OpenRouter API with streaming response
3. **Ustadz Persona**: System prompt configured as Islamic scholar (ustadz/kyai)
4. **Response Rendering**: Markdown via react-markdown + QuranCard components for citations

**Key Files:**
- `src/services/aiChatApi.ts` - Streaming chat with AbortController support
- `src/services/openRouterApi.ts` - Model fetching with caching
- `src/hooks/useChatDB.ts` - Chat session management via IndexedDB
- `src/hooks/useModels.ts` - Model filtering/sorting (newest, oldest, price, context)
- `src/contexts/ChatContext.tsx` - Shared state between AiChatPage and ChatContainer
- `src/lib/chatDB.ts` - IndexedDB schema for sessions, models, settings
- `src/components/chat/ChatMessage.tsx` - Markdown rendering with custom components

**Model Selector Features:**
- Filter: All / Free / Paid models
- Sort: Newest, Oldest, Name A-Z, Name Z-A, Price (low/high), Context length
- Refresh button to fetch latest models
- 1-hour cache with IndexedDB persistence

**Streaming Features:**
- Real-time chunk display
- Reasoning token support (for models like DeepSeek R1)
- Stop button with AbortController
- Handles multiple response formats (reasoning_details, reasoning_content, reasoning)

Environment variables (`.env`):
```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### State Management Pattern

No global state library. State is managed via:

1. **React Query** for server state (surah list, surah detail, tafsir, prayer times, doa, imsakiyah)
2. **React Context** for shared component state:
   - `ChatContext` - Shared chat state between AiChatPage and ChatContainer (solves duplicate hook issue)
3. **Custom hooks with IndexedDB** for persistent chat data:
   - `useChatDB` - Chat sessions, messages, streaming state
   - `useModels` - AI model list with caching and filtering
4. **Custom hooks with localStorage** for persistent settings:
   - `useSettings` - theme, font size, display preferences
   - `useBookmarks` - saved ayat references
   - `useReadingHistory` - recently read surahs
   - `useSidebarState` - sidebar collapsed/expanded state
5. **Geolocation hook** for location-based features:
   - `useGeolocation` - browser location with Haversine distance calculation for nearest city

### IndexedDB Schema (chatDB.ts)

```typescript
interface ChatDBSchema {
  sessions: { key: string; value: ChatSession; indexes: { "by-updated": number } };
  models: { key: string; value: AIModel; indexes: { "by-free": number } };
  settings: { key: string; value: SettingValue };
}

interface AIModel {
  id: string;
  name: string;
  description?: string;
  pricing: { prompt: number; completion: number };
  context_length: number;
  isFree: boolean;
  created?: number; // Unix timestamp for sorting
}
```

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
- Animations: Tailwind animate-in utilities (fade-in, slide-in-from-bottom)

### TypeScript Configuration

The project has relaxed TypeScript settings (`noImplicitAny: false`, `strictNullChecks: false`). When adding new code, follow existing patterns rather than adding strict types.

### Testing

Tests use Vitest with jsdom environment and React Testing Library. Test files go in `src/test/` or alongside source files with `.test.ts(x)` suffix.

### Dependencies

Key external packages:
- `quran-validator` - Validates and auto-corrects Quran citations in LLM responses
- `@tanstack/react-query` - Server state management
- `react-markdown` - Markdown rendering for AI responses
- `remark-gfm` - GitHub Flavored Markdown support
- `idb` - IndexedDB wrapper for chat persistence
- `lucide-react` - Icon library
- `sonner` - Toast notifications

### Common Patterns

**Scroll to Ayat with Highlight (SurahPage.tsx:84-100):**
```typescript
useEffect(() => {
  if (surah && location.hash) {
    const ayatId = location.hash.slice(1);
    const element = document.getElementById(ayatId);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => element.classList.remove(...), 2000);
      }, 300);
    }
  }
}, [surah, location.hash]);
```

**Streaming with AbortController (aiChatApi.ts):**
```typescript
const response = await fetch(url, {
  method: "POST",
  headers: { ... },
  body: JSON.stringify({ ... }),
  signal, // AbortSignal for cancellation
});
// Handle SSE stream with reasoning token support
```

**Shared Context Pattern (ChatContext.tsx):**
```typescript
export function ChatProvider({ children }: { children: ReactNode }) {
  const chatDB = useChatDB();
  return <ChatContext.Provider value={chatDB}>{children}</ChatContext.Provider>;
}
// Use useChat() in child components instead of useChatDB() directly
```
