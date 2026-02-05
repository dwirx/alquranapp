# Al-Quran Digital Indonesia

<div align="center">

![Al-Quran Digital](public/og-image.png)

**Aplikasi Al-Quran digital lengkap berbahasa Indonesia**

Baca, dengarkan, dan pahami Al-Quran dengan mudah. Dilengkapi jadwal shalat, imsakiyah Ramadhan, kumpulan doa harian, dan AI Ustadz untuk tanya jawab seputar Islam.

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)](https://vitejs.dev)

</div>

---

## Fitur Utama

### Al-Quran Lengkap
- **114 Surah** dengan teks Arab, transliterasi latin, dan terjemahan Indonesia
- **Audio murottal** per ayat dari qari terkenal dengan kontrol lengkap
- **Tafsir lengkap** untuk memahami makna setiap ayat
- **Bookmark** ayat favorit untuk dibaca kembali
- **Riwayat bacaan** tersimpan otomatis
- **Navigasi langsung ke ayat** via link dengan efek highlight

### AI Ustadz - Asisten Islami
- **Tanya jawab Islam** dengan AI yang berperan sebagai ustadz/kyai
- **100+ model AI** dari OpenRouter (gratis & berbayar)
- **Pencarian semantik** Al-Quran dengan kutipan presisi (surah:ayat)
- **Markdown preview** untuk respons yang mudah dibaca
- **Streaming response** dengan tombol stop
- **Riwayat chat** tersimpan di IndexedDB
- **Filter & sorting model** (terbaru, terlama, harga, context length)

### Jadwal Shalat
- Waktu shalat akurat berdasarkan **lokasi GPS** atau pilihan manual
- Mendukung seluruh **provinsi dan kota** di Indonesia
- Tampilan waktu shalat berikutnya dengan countdown
- Sinkronisasi lokasi dengan jadwal imsakiyah

### Jadwal Imsakiyah Ramadhan
- Jadwal lengkap **30 hari** Ramadhan 1447H/2026M
- Waktu imsak dan berbuka untuk seluruh Indonesia
- Highlight hari ini dengan tampilan khusus
- Data dari Kementerian Agama RI

### Kumpulan Doa & Dzikir
- **228+ doa dan dzikir** harian lengkap
- Teks Arab dengan transliterasi dan terjemahan
- Filter berdasarkan kategori dan tag
- Pencarian cepat berdasarkan judul atau isi

### Pengaturan Personalisasi
- **Mode gelap/terang/sistem** untuk kenyamanan membaca
- **Ukuran font** yang dapat disesuaikan (kecil, sedang, besar)
- Opsi tampilkan/sembunyikan teks latin
- Opsi tampilkan/sembunyikan terjemahan
- Putar otomatis audio ke ayat berikutnya

---

## Tampilan Responsif

Aplikasi mendukung **3 breakpoint** untuk pengalaman optimal di semua perangkat:

| Perangkat | Breakpoint | Layout |
|-----------|------------|--------|
| Mobile | < 768px | Bottom navigation, full-width content |
| Tablet | 768px - 1024px | Adjusted spacing, optimized grids |
| Desktop | ≥ 1024px | Collapsible sidebar, multi-column layout |

**Fitur Desktop:**
- Sidebar navigasi yang bisa di-collapse (240px ↔ 64px)
- Dashboard dengan widget grid
- Multi-column layout untuk daftar surah dan doa

---

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | shadcn/ui (Radix primitives) |
| **State Management** | React Query + IndexedDB + localStorage |
| **Routing** | React Router 6 |
| **AI/LLM** | OpenRouter API (100+ models) |
| **Markdown** | react-markdown + remark-gfm |
| **Testing** | Vitest + React Testing Library |
| **Icons** | Lucide React |

---

## Sumber Data

| Data | Sumber |
|------|--------|
| Al-Quran & Tafsir | [eQuran.id API v2](https://equran.id/apidev) |
| Jadwal Shalat | [eQuran.id API](https://equran.id/apidev) |
| Jadwal Imsakiyah | [MyQuran API](https://api.myquran.com/) |
| Doa & Dzikir | [Open Doa API](https://open-api.my.id/api/doa) |
| AI Chat Models | [OpenRouter API](https://openrouter.ai/) |
| Vector Search | [eQuran.id Vector API](https://equran.id/apidev) |

---

## Menjalankan Proyek

### Prasyarat
- Node.js 18+ atau Bun
- API Key dari OpenRouter (untuk fitur AI Chat)

### Instalasi

```bash
# Clone repository
git clone <repository-url>
cd alquranApp

# Install dependencies
npm install
# atau
bun install

# Setup environment variables
cp .env.example .env
# Edit .env dan masukkan VITE_OPENROUTER_API_KEY

# Jalankan development server
npm run dev
# atau
bun dev
```

Aplikasi berjalan di `http://localhost:8080`

### Environment Variables

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### Scripts

```bash
npm run dev        # Development server (port 8080)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint check
npm run test       # Run tests
npm run test:watch # Run tests in watch mode
```

---

## Struktur Proyek

```
src/
├── components/           # Komponen UI
│   ├── chat/            # AI Chat components
│   │   ├── ChatContainer.tsx
│   │   ├── ChatHistory.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ModelSelector.tsx
│   │   └── QuranCard.tsx
│   ├── layout/          # Layout components
│   │   ├── AppSidebar.tsx
│   │   └── ResponsiveLayout.tsx
│   ├── ui/              # shadcn/ui primitives
│   ├── AyatCard.tsx     # Kartu ayat Al-Quran
│   ├── DoaCard.tsx      # Kartu doa
│   ├── SurahCard.tsx    # Kartu surah
│   └── ...
├── contexts/            # React Contexts
│   └── ChatContext.tsx  # Shared chat state
├── hooks/               # Custom React hooks
│   ├── useBookmarks.ts
│   ├── useChatDB.ts     # IndexedDB chat operations
│   ├── useModels.ts     # AI model management
│   ├── useSettings.ts
│   ├── useReadingHistory.ts
│   └── useLocalStorage.ts
├── lib/                 # Utilities
│   ├── chatDB.ts        # IndexedDB schema & operations
│   ├── quranParser.ts   # Parse AI response for Quran refs
│   └── utils.ts
├── pages/               # Route pages
│   ├── Index.tsx        # Home dashboard
│   ├── SurahPage.tsx    # Surah detail + audio
│   ├── AiChatPage.tsx   # AI Ustadz chat
│   ├── ShalatPage.tsx   # Prayer times
│   ├── ImsakiyahPage.tsx
│   ├── DoaPage.tsx
│   ├── BookmarkPage.tsx
│   └── SettingsPage.tsx
├── services/            # API services
│   ├── quranApi.ts
│   ├── shalatApi.ts
│   ├── aiChatApi.ts     # OpenRouter streaming
│   ├── openRouterApi.ts # Model fetching
│   ├── vectorSearchApi.ts
│   └── ...
└── types/               # TypeScript interfaces
    ├── quran.ts
    ├── chat.ts
    └── ...
```

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                        External APIs                         │
│  (eQuran.id, MyQuran, Open Doa API, OpenRouter)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     services/*.ts                            │
│  (quranApi, shalatApi, aiChatApi, openRouterApi, etc.)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              React Query Cache / ChatContext                 │
│  (Server state + Shared chat state via Context)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      pages/*.tsx                             │
│  (Route components dengan business logic)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    components/*.tsx                          │
│  (Reusable UI components)                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               IndexedDB / localStorage                       │
│  (Chat sessions, Models cache, Bookmarks, Settings)         │
└─────────────────────────────────────────────────────────────┘
```

### AI Chat Architecture (RAG)

```
┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ User Message │───▶│  Vector Search  │───▶│  OpenRouter API  │
└──────────────┘    │  (eQuran.id)    │    │  (100+ models)   │
                    └─────────────────┘    └──────────────────┘
                              │                      │
                              ▼                      ▼
                    ┌─────────────────┐    ┌──────────────────┐
                    │ Quran Context   │    │ Streaming Chunks │
                    │ (Top 5 ayat)    │    │ + Reasoning      │
                    └─────────────────┘    └──────────────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────┐
                                          │ Markdown + Quran │
                                          │ Cards Rendering  │
                                          └──────────────────┘
```

---

## Kontribusi

Kontribusi sangat diterima! Silakan buka issue atau pull request untuk:
- Bug fixes
- Fitur baru
- Perbaikan dokumentasi
- Optimisasi performa

---

## Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

---

<div align="center">

**Dibuat dengan penuh dedikasi untuk umat Islam Indonesia**

</div>
