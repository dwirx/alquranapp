# Al-Quran Digital Indonesia

<div align="center">

![Al-Quran Digital](public/og-image.png)

**Aplikasi Al-Quran digital lengkap berbahasa Indonesia**

Baca, dengarkan, dan pahami Al-Quran dengan mudah. Dilengkapi jadwal shalat, imsakiyah Ramadhan, dan kumpulan doa harian.

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)](https://vitejs.dev)

</div>

---

## Fitur Utama

### Al-Quran Lengkap
- **114 Surah** dengan teks Arab, transliterasi latin, dan terjemahan Indonesia
- **Audio murottal** per surah dari qari terkenal
- **Tafsir lengkap** untuk memahami makna setiap ayat
- **Bookmark** ayat favorit untuk dibaca kembali
- **Riwayat bacaan** tersimpan otomatis

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
| **State Management** | React Query + localStorage hooks |
| **Routing** | React Router 6 |
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

---

## Menjalankan Proyek

### Prasyarat
- Node.js 18+ atau Bun

### Instalasi

```bash
# Clone repository
git clone <repository-url>
cd alquranApp

# Install dependencies
npm install
# atau
bun install

# Jalankan development server
npm run dev
# atau
bun dev
```

Aplikasi berjalan di `http://localhost:8080`

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
│   ├── layout/          # Layout components (Sidebar, ResponsiveLayout)
│   ├── ui/              # shadcn/ui primitives
│   ├── AyatCard.tsx     # Kartu ayat Al-Quran
│   ├── DoaCard.tsx      # Kartu doa
│   ├── SurahCard.tsx    # Kartu surah
│   ├── TodayPrayerCard.tsx
│   ├── TodayImsakiyahCard.tsx
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useBookmarks.ts  # Bookmark management
│   ├── useSettings.ts   # App settings
│   ├── useReadingHistory.ts
│   ├── useSidebarState.ts
│   └── useLocalStorage.ts
├── pages/               # Route pages
│   ├── Index.tsx        # Home dashboard
│   ├── SurahPage.tsx    # Surah detail + audio
│   ├── ShalatPage.tsx   # Prayer times
│   ├── ImsakiyahPage.tsx # Ramadhan schedule
│   ├── DoaPage.tsx      # Doa collection
│   ├── BookmarkPage.tsx # Saved bookmarks
│   └── SettingsPage.tsx # App settings
├── services/            # API services
│   ├── quranApi.ts      # Quran & Tafsir API
│   ├── shalatApi.ts     # Prayer times API
│   ├── imsakiyahApi.ts  # Imsakiyah API
│   └── doaApi.ts        # Doa API
└── types/               # TypeScript interfaces
    ├── quran.ts
    ├── shalat.ts
    ├── imsakiyah.ts
    └── doa.ts
```

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                        External APIs                         │
│  (eQuran.id, MyQuran, Open Doa API)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     services/*.ts                            │
│  (quranApi, shalatApi, imsakiyahApi, doaApi)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Query Cache                         │
│  (Server state management dengan caching)                   │
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
│                      localStorage                            │
│  (Bookmarks, Settings, Reading History, Sidebar State)      │
└─────────────────────────────────────────────────────────────┘
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
