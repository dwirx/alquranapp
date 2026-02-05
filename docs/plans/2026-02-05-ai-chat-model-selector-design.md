# AI Chat Model Selector & IndexedDB Storage Design

## Overview

Menambahkan fitur pemilihan model AI dengan filter (gratis/berbayar) dan migrasi penyimpanan chat dari localStorage ke IndexedDB.

## Features

1. **Model Selector** - Dropdown di header chat untuk pilih model
2. **Filter Model** - Tab filter "Semua | Gratis | Berbayar"
3. **IndexedDB Storage** - Unlimited chat history dengan persistensi yang lebih baik
4. **Fetch Models dari API** - List model selalu up-to-date dari OpenRouter

---

## Data Types

### Model Type

```typescript
interface AIModel {
  id: string;              // "openai/gpt-4.1-mini"
  name: string;            // "GPT-4.1 Mini"
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
  isFree: boolean;         // computed: pricing.prompt === 0
}
```

### Updated ChatSession

```typescript
interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  modelId: string;         // NEW: model yang digunakan
  createdAt: number;
  updatedAt: number;
}
```

---

## IndexedDB Schema

```
Database: "alquran-chat-db" (version: 1)

Stores:
├── sessions (keyPath: "id")
│   └── Index: "updatedAt" (untuk sorting)
├── models (keyPath: "id")
│   └── Index: "isFree" (untuk filter)
└── settings (keyPath: "key")
    └── Stores: selectedModel, modelsCacheTime, etc.
```

---

## File Structure

```
src/
├── components/chat/
│   ├── ModelSelector.tsx      # Dropdown dengan filter tabs
│   ├── ChatHeader.tsx         # Header dengan model selector
│   ├── ChatContainer.tsx      # Updated
│   └── ... (existing)
├── hooks/
│   ├── useModels.ts           # Fetch & cache models
│   ├── useChatDB.ts           # IndexedDB CRUD operations
│   └── useChatHistory.ts      # Updated to use IndexedDB
├── services/
│   ├── openRouterApi.ts       # Fetch models + chat
│   └── aiChatApi.ts           # Updated
├── lib/
│   └── chatDB.ts              # IndexedDB wrapper (idb library)
└── types/
    └── chat.ts                # Updated types
```

---

## UI Components

### Model Selector Layout

```
┌─────────────────────────────────────────┐
│  AI Chat                    [GPT-4.1 ▼] │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [Semua] [Gratis] [Berbayar]         │ │
│ ├─────────────────────────────────────┤ │
│ │ 🟢 GPT-4.1 Mini          Free       │ │
│ │ 🟢 Gemini 2.0 Flash      Free       │ │
│ │ 🔵 Claude 3.5 Sonnet     $0.003     │ │
│ │ 🔵 GPT-4o                $0.005     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Data Flow

### Fetch Models

```
App Load → useModels()
              ↓
    Check IndexedDB cache (< 1 jam?)
        ├── Yes → Return cached
        └── No → Fetch OpenRouter /api/v1/models
                      ↓
                Transform + compute isFree
                      ↓
                Save to IndexedDB → Return
```

### Chat with Model Selection

```
User selects model → Save to IndexedDB settings
                          ↓
User sends message → useChatDB.addMessage()
                          ↓
                    streamAiResponse(modelId, messages)
                          ↓
                    Streaming → Update IndexedDB
                          ↓
                    Complete → Session saved with modelId
```

### Migration (one-time)

```
App Load → Check localStorage "ai-chat-sessions"
              ├── Empty → Skip
              └── Has data → Migrate to IndexedDB
                                  ↓
                            Delete localStorage
```

---

## Error Handling

| Scenario | Solution |
|----------|----------|
| Fetch models failed | Use fallback 5 popular models |
| IndexedDB not supported | Fallback to localStorage |
| Selected model unavailable | Reset to default model |
| Stream interrupted | Save partial + show error |

### Fallback Models

```typescript
const DEFAULT_MODEL = "openai/gpt-4.1-mini";

const FALLBACK_MODELS = [
  { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini", isFree: true },
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", isFree: true },
  { id: "meta-llama/llama-3.3-8b-instruct:free", name: "Llama 3.3 8B", isFree: true },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", isFree: false },
  { id: "openai/gpt-4o", name: "GPT-4o", isFree: false },
];
```

---

## Cache Strategy

- **Models list**: 1 hour cache in IndexedDB
- **Selected model**: Persist in IndexedDB settings
- **Chat sessions**: Permanent, user deletes manually

---

## Dependencies

```bash
npm install idb  # IndexedDB wrapper library
```

---

## Implementation Order

1. Setup IndexedDB with `idb` library (`lib/chatDB.ts`)
2. Create `useChatDB` hook for CRUD operations
3. Migrate `useChatHistory` to use IndexedDB
4. Create `openRouterApi.ts` for fetching models
5. Create `useModels` hook with caching
6. Create `ModelSelector` component
7. Create `ChatHeader` component
8. Update `ChatContainer` to use new hooks
9. Add migration logic for existing localStorage data
10. Test & verify
