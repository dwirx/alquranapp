# 📖 Al-Quran Digital Indonesia

Aplikasi Al-Quran digital berbahasa Indonesia dengan fitur lengkap untuk membaca, mendengarkan, dan memahami Al-Quran. Dilengkapi dengan jadwal shalat berdasarkan lokasi.

![Al-Quran Digital](public/og-image.png)

## ✨ Fitur Utama

### 📚 Al-Quran
- **114 Surah lengkap** dengan teks Arab, latin, dan terjemahan Indonesia
- **Audio murottal** per surah dari qari terkenal
- **Tafsir** untuk memahami makna ayat
- **Bookmark ayat** favorit untuk dibaca kembali
- **Riwayat bacaan** otomatis tersimpan

### 🕌 Jadwal Shalat
- Waktu shalat akurat berdasarkan **lokasi GPS**
- Mendukung **100+ kota** di Indonesia
- Tampilan waktu shalat berikutnya

### ⚙️ Pengaturan
- **Mode gelap/terang** untuk kenyamanan membaca
- **Ukuran font** yang dapat disesuaikan (kecil, sedang, besar)
- Opsi tampilkan/sembunyikan **teks latin**
- Opsi tampilkan/sembunyikan **terjemahan**

## 🛠️ Teknologi

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **React Query** - Data Fetching
- **React Router** - Navigation

## 📡 Sumber Data

- **Al-Quran API**: [eQuran.id API v2](https://equran.id/apidev)
- **Jadwal Shalat API**: [MyQuran API](https://api.myquran.com/)

## 🚀 Menjalankan Proyek

### Prasyarat
- Node.js 18+ atau Bun

### Instalasi

```bash
# Clone repository
git clone <repository-url>

# Masuk ke direktori proyek
cd al-quran-digital

# Install dependencies
npm install
# atau
bun install

# Jalankan development server
npm run dev
# atau
bun dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📁 Struktur Proyek

```
src/
├── components/        # Komponen UI
│   ├── ui/           # shadcn/ui components
│   ├── AyatCard.tsx  # Kartu ayat
│   ├── SurahCard.tsx # Kartu surah
│   ├── BottomNav.tsx # Navigasi bawah
│   └── ...
├── hooks/            # Custom React hooks
│   ├── useBookmarks.ts
│   ├── useSettings.ts
│   └── ...
├── pages/            # Halaman aplikasi
│   ├── Index.tsx     # Beranda
│   ├── SurahPage.tsx # Detail surah
│   ├── ShalatPage.tsx
│   └── ...
├── services/         # API services
│   ├── quranApi.ts
│   └── shalatApi.ts
└── types/            # TypeScript types
```

## 📱 Tampilan

Aplikasi didesain dengan pendekatan **mobile-first** untuk pengalaman terbaik di perangkat mobile, namun tetap responsif di desktop.

## 📄 Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

---

**Dibuat dengan ❤️ menggunakan [Lovable](https://lovable.dev)**
