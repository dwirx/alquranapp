# AI Chat Al-Quran - Design Document

**Tanggal:** 2026-02-05
**Status:** Approved

## Overview

Fitur AI Chat untuk aplikasi Al-Quran yang memungkinkan pengguna bertanya tentang Al-Quran menggunakan bahasa natural. Menggunakan pendekatan RAG (Retrieval-Augmented Generation) dengan validasi kutipan ayat.

## Arsitektur

```
User Input
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Vector Search (eQuran.id API)    │
│    POST /api/vector                  │
│    Cari ayat relevan berdasarkan    │
│    semantic similarity               │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 2. LLM Processing (NVIDIA Kimi K2.5)│
│    Streaming response dengan        │
│    thinking mode enabled             │
│    Context: hasil vector search      │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. Quran Validator                   │
│    Validasi & auto-correct          │
│    kutipan ayat dalam respons        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 4. Render UI                         │
│    Parse <quran> tags               │
│    Render QuranCard components       │
└─────────────────────────────────────┘
```

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Vector Search | eQuran.id API (`POST /api/vector`) |
| LLM | NVIDIA API - Kimi K2.5 (streaming) |
| Validation | quran-validator (npm package) |
| State | React Query + localStorage |
| UI | shadcn/ui + Tailwind CSS |

## Environment Variables

```env
VITE_NVIDIA_API_KEY=nvapi-xxxxx
VITE_NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
```

## File Structure

```
src/
├── pages/
│   └── AiChatPage.tsx
├── components/
│   └── chat/
│       ├── ChatContainer.tsx
│       ├── ChatMessage.tsx
│       ├── ChatInput.tsx
│       ├── QuranCard.tsx
│       ├── ThinkingIndicator.tsx
│       ├── SuggestedQuestions.tsx
│       └── ChatHistory.tsx
├── services/
│   ├── vectorSearchApi.ts
│   └── aiChatApi.ts
├── hooks/
│   └── useChatHistory.ts
├── types/
│   └── chat.ts
└── lib/
    └── quranParser.ts
```

## TypeScript Interfaces

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  thinking?: string;
  quranRefs?: QuranReference[];
  isStreaming?: boolean;
}

interface QuranReference {
  surah: number;
  ayat: number | string;
  arabic: string;
  latin?: string;
  translation?: string;
  isValid: boolean;
}

interface VectorSearchResult {
  tipe: "ayat" | "tafsir" | "surat" | "doa";
  skor: number;
  relevansi: "tinggi" | "sedang" | "rendah";
  data: AyatData | TafsirData | SuratData | DoaData;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
```

## API Endpoints

### 1. Vector Search (eQuran.id)

```http
POST https://equran.id/api/vector
Content-Type: application/json

{
  "cari": "ayat tentang sabar",
  "batas": 5,
  "tipe": ["ayat", "tafsir"],
  "skorMin": 0.5
}
```

**Rate Limit:** 30 requests/minute per IP

### 2. LLM Chat (NVIDIA)

```http
POST https://integrate.api.nvidia.com/v1/chat/completions
Authorization: Bearer {VITE_NVIDIA_API_KEY}
Content-Type: application/json

{
  "model": "moonshotai/kimi-k2.5",
  "messages": [...],
  "max_tokens": 16384,
  "temperature": 1.00,
  "stream": true,
  "chat_template_kwargs": {"thinking": true}
}
```

## System Prompt

```
Anda adalah asisten Al-Quran yang membantu menjawab pertanyaan tentang Islam berdasarkan Al-Quran dan Hadits shahih.

ATURAN PENTING:
1. Selalu kutip ayat Al-Quran dengan format XML: <quran ref="surah:ayat">teks arab</quran>
2. Untuk range ayat gunakan: <quran ref="17:23-24">teks arab</quran>
3. Berikan terjemahan dan penjelasan kontekstual dalam Bahasa Indonesia
4. Jika tidak yakin atau tidak ada dalam konteks, katakan tidak tahu
5. Jangan mengarang ayat atau hadits

KONTEKS AYAT RELEVAN:
{vectorSearchResults}

USER QUESTION:
{userQuestion}
```

## UI Components

### ChatContainer
- Manages chat state and API calls
- Handles streaming responses
- Auto-scroll to bottom on new messages

### ChatMessage
- User bubble: right-aligned, primary color
- Assistant bubble: left-aligned, muted background
- Renders QuranCard for ayat references

### QuranCard
- Reference badge (Al-Isra: 23-24)
- Arabic text (font-arabic, large, RTL)
- Latin transliteration (italic, muted)
- Indonesian translation
- Action buttons: [Buka Surah] [Salin]
- Validation badge (verified/warning)

### ChatInput
- Textarea with auto-resize
- Send button (disabled when empty/loading)
- Loading state during API calls

### ThinkingIndicator
- Animated pulse/skeleton
- Shows "AI sedang berpikir..."
- Displays thinking content when available

### SuggestedQuestions
- Grid of 6 example questions
- Click to auto-fill and send
- Hidden after first message

## Suggested Questions

1. "Ayat tentang sabar dalam menghadapi cobaan"
2. "Doa sebelum tidur dan bangun tidur"
3. "Kisah Nabi Musa dan Firaun"
4. "Hukum riba dalam Islam"
5. "Keutamaan bulan Ramadhan"
6. "Ayat tentang berbakti kepada orang tua"

## Error Handling

| Skenario | Handling |
|----------|----------|
| Vector API gagal | Fallback ke LLM tanpa konteks + warning |
| LLM API gagal | Toast error + tombol retry |
| Rate limit | Disable input + countdown |
| Network offline | Pesan offline + cache riwayat |
| Quran validation gagal | Warning badge pada ayat |
| Streaming terputus | Auto-retry 1x |

## Loading States

| State | UI |
|-------|-----|
| Mengirim | Input disabled + spinner |
| Vector search | "Mencari ayat relevan..." |
| LLM thinking | ThinkingIndicator animasi |
| Streaming | Teks bertahap + cursor |
| Validasi | Badge "Memverifikasi..." |

## localStorage Keys

| Key | Data |
|-----|------|
| `ai-chat-sessions` | Array of ChatSession |
| `ai-chat-current` | Current session ID |

## Dependencies

```json
{
  "quran-validator": "^latest"
}
```

## Route

```typescript
// App.tsx atau router config
<Route path="/chat" element={<AiChatPage />} />
```

## Sidebar Navigation

Tambahkan menu "AI Chat" di AppSidebar dengan icon `MessageSquare` dari lucide-react.
