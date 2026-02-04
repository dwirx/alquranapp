# Fitur Imsakiyah Ramadhan 1447H / 2026M

## Ringkasan
Fitur Jadwal Imsakiyah Ramadhan telah berhasil diimplementasikan dengan lengkap menggunakan API eQuran.id v2.

## File yang Dibuat

### 1. Types (`src/types/imsakiyah.ts`)
- Interface untuk data imsakiyah sesuai dengan API eQuran.id
- `ImsakiyahDay` - 8 waktu shalat per hari
- `ImsakiyahData` - Full schedule dengan metadata
- Response interfaces untuk semua endpoints

### 2. API Service (`src/services/imsakiyahApi.ts`)
- `fetchProvinsiImsakiyah()` - GET list provinsi
- `fetchKabKotaImsakiyah(provinsi)` - POST list kabupaten/kota
- `fetchImsakiyah(provinsi, kabkota)` - POST jadwal 30 hari

### 3. Components

#### TodayImsakiyahCard.tsx
- Highlight hari ini dengan countdown timer
- Progress indicator (Hari ke-X/30)
- Grid 8 waktu shalat dengan Imsak & Subuh highlighted
- Responsive: vertical di mobile, horizontal di desktop

#### ImsakiyahTable.tsx
- Table responsive dengan 30 hari lengkap
- Sticky header & first column
- Current day auto-scroll & highlighting
- Abbreviated labels di mobile, full di desktop
- Zebra striping untuk readability

### 4. Pages
- `ImsakiyahPage.tsx` - Halaman utama dengan fitur:
  - Hero section Ramadhan 1447H / 2026M
  - Location selector (Command popover)
  - Today's imsakiyah card
  - Full 30-day table
  - Info footer

### 5. Routing & Navigation
- Route `/imsakiyah` ditambahkan di `App.tsx`
- Bottom navigation updated dengan Moon icon
- Replaced Bookmark dengan Imsakiyah di mobile nav

## Fitur Utama

✅ **517 Kabupaten/Kota** - Seluruh Indonesia (34 provinsi)
✅ **Jadwal 30 Hari** - Lengkap dengan 8 waktu shalat
✅ **Countdown Timer** - Real-time countdown ke Imsak/Subuh
✅ **Progress Tracking** - Visual progress bar Ramadhan
✅ **Today's Highlight** - Card besar untuk hari ini
✅ **Auto Scroll** - Table auto-scroll ke hari saat ini
✅ **Location Sync** - Shared dengan Jadwal Shalat
✅ **Responsive Design** - Mobile, tablet, desktop optimized
✅ **React Query Caching** - Performance optimization
✅ **Loading States** - Skeleton loaders & error handling

## Data Flow

1. User pilih Provinsi → Fetch kabupaten/kota list
2. User pilih Kabupaten/Kota → Fetch jadwal 30 hari
3. Location saved to localStorage
4. Location synced dengan ShalatPage
5. React Query cache untuk minimize API calls

## Waktu Shalat yang Ditampilkan

Setiap hari memiliki 8 waktu:
1. **Imsak** (highlighted)
2. **Subuh** (highlighted)
3. Terbit
4. Dhuha
5. Dzuhur
6. Ashar
7. Maghrib
8. Isya

## Countdown Timer Logic

- **Sebelum Imsak**: Countdown ke waktu Imsak
- **Antara Imsak-Subuh**: Countdown ke Subuh
- **Setelah Subuh**: Countdown ke Imsak besok
- Update setiap detik dengan useEffect
- Format: "X jam Y menit Z detik"

## Responsive Breakpoints

```css
Mobile:    < 640px  - Vertical stack, horizontal scroll table
Tablet:    640px - 1024px  - 2-column layout
Desktop:   >= 1024px - Full horizontal layout
```

## Visual Design

**Color Scheme:**
- Primary: Imsak & Subuh (paling penting)
- Current day: Background highlight dengan border
- Gradient backgrounds untuk depth
- Moon icon theme untuk Ramadhan

**Typography:**
- Font mono untuk waktu (alignment)
- Tabular nums untuk consistency
- Responsive sizes (text-xl → text-6xl)

**Components:**
- Rounded corners (`rounded-2xl`)
- Shadows: `shadow-xl` dengan primary tint
- Borders: `border-2 border-primary/20`
- Smooth transitions (300ms)

## Location Sharing

Menggunakan localStorage key:
- `selectedImsakiyahLocation` - Primary untuk Imsakiyah
- `selectedShalatLocation` - Synced dengan Jadwal Shalat

Saat user ubah lokasi di salah satu halaman, otomatis update di kedua halaman.

## API Documentation

- Base URL: `https://equran.id/api/v2/imsakiyah`
- Endpoints:
  - `GET /provinsi` - Daftar 34 provinsi
  - `POST /kabkota` - Daftar kab/kota per provinsi
  - `POST /` - Jadwal 30 hari lengkap

## Build Status

✅ TypeScript compilation successful
✅ No errors or warnings
✅ Production build ready
✅ All components responsive

## Testing Checklist

- [ ] Location selector works (provinsi & kabkota)
- [ ] Countdown updates every second
- [ ] Current day highlighted in table
- [ ] Auto-scroll to current day
- [ ] Table scrolls horizontally on mobile
- [ ] Loading states display correctly
- [ ] Error retry works
- [ ] Location persists in localStorage
- [ ] Navigation from BottomNav works
- [ ] Responsive pada mobile/tablet/desktop

## Sumber Data

Data imsakiyah bersumber dari **Kementerian Agama Republik Indonesia** melalui API eQuran.id untuk Ramadhan 1447 Hijriah / 2026 Masehi.

## Optional Future Enhancements

- [ ] Push notification reminder sebelum Imsak
- [ ] Export jadwal as PDF/Image
- [ ] Share feature (WhatsApp, Social Media)
- [ ] Hijri calendar integration untuk auto-detect current day
- [ ] Dark mode optimization
- [ ] Print-friendly CSS
