# Responsive UI/UX Design - Al-Quran App

**Tanggal**: 5 Februari 2026
**Status**: Approved

## Overview

Menyempurnakan UI/UX aplikasi Al-Quran agar responsive dan kompatibel di semua device (mobile, tablet, desktop) dengan pengalaman yang optimal di setiap breakpoint.

## Keputusan Design

| Aspek | Keputusan |
|-------|-----------|
| Layout Desktop | Sidebar + Content |
| Gaya Sidebar | Collapsible (expand/collapse) |
| Layout Konten | Master-Detail Split View |
| Breakpoints | 3 Breakpoint (Mobile/Tablet/Desktop) |
| Visual | Subtle Enhancements (micro-interactions) |

## Breakpoint Strategy

| Breakpoint | Range | Layout |
|------------|-------|--------|
| Mobile | < 768px | BottomNav, single column, full-width |
| Tablet | 768-1024px | TopNav, wider content, mini sidebar |
| Desktop | ≥ 1024px | Collapsible Sidebar, Master-Detail split |

## Layout Structure

### Mobile (< 768px)

```
┌─────────────────────────────────────────┐
│                 Header                  │
├─────────────────────────────────────────┤
│                                         │
│           Full-width Content            │
│           (Single Column)               │
│                                         │
├─────────────────────────────────────────┤
│   🏠   📿   🌙   🕌   ⚙️  BottomNav    │
└─────────────────────────────────────────┘
```

### Tablet (768-1024px)

```
┌─────────────────────────────────────────┐
│            Header + TopNav              │
├────┬────────────────────────────────────┤
│Mini│                                    │
│Side│        Wider Content Area          │
│bar │        (max-w-3xl centered)        │
└────┴────────────────────────────────────┘
```

### Desktop (≥ 1024px)

```
┌──────────┬─────────────────┬────────────────────────┐
│          │                 │                        │
│ Sidebar  │   Master List   │    Detail Panel        │
│ (240px)  │   (360px)       │    (flex-1)            │
│          │   (Scrollable)  │                        │
│ Collaps- │                 │                        │
│ ible     │                 │                        │
└──────────┴─────────────────┴────────────────────────┘
```

## Komponen Sidebar

### Expanded State (240px)

```
┌────────────────────────────────────┐
│  ☪️  Al-Quran App          [«]    │
├────────────────────────────────────┤
│  🏠  Beranda                       │
│  📖  Al-Quran                      │
│  📿  Doa Harian                    │
│  🌙  Imsakiyah                     │
│  🕌  Waktu Shalat                  │
│  🔖  Bookmark                      │
├────────────────────────────────────┤
│  ⚙️  Pengaturan                    │
│  🌓  Dark Mode         [Toggle]   │
└────────────────────────────────────┘
```

### Collapsed State (64px)

```
┌────────────┐
│     ☪️     │
├────────────┤
│     🏠     │
│     📖     │
│     📿     │
│     🌙     │
│     🕌     │
│     🔖     │
├────────────┤
│     ⚙️     │
└────────────┘
```

### Sidebar Behavior

- State disimpan di localStorage via `useSettings`
- Hover pada collapsed menampilkan tooltip
- Transition smooth 200ms
- Keyboard shortcut `Cmd/Ctrl + B` untuk toggle

## Master-Detail Layout

### Al-Quran Page

```
┌──────────────────────────────┬─────────────────────────────────┐
│        MASTER (360px)        │         DETAIL (flex-1)         │
├──────────────────────────────┼─────────────────────────────────┤
│ ┌──────────────────────────┐ │ ┌─────────────────────────────┐ │
│ │ 🔍 Cari surah...         │ │ │  Al-Fatihah                 │ │
│ └──────────────────────────┘ │ │  الفاتحة                     │ │
│                              │ │  7 Ayat • Makkiyah          │ │
│ ┌──────────────────────────┐ │ │  ▶️ Play  🔖 Bookmark       │ │
│ │ 1. Al-Fatihah      ← ███ │ │ ├─────────────────────────────┤ │
│ │    الفاتحة    7 ayat     │ │ │                             │ │
│ └──────────────────────────┘ │ │  بِسْمِ اللَّهِ الرَّحْمَٰنِ  │ │
│ ┌──────────────────────────┐ │ │  الرَّحِيمِ                  │ │
│ │ 2. Al-Baqarah            │ │ │                             │ │
│ │    البقرة    286 ayat    │ │ │  Dengan nama Allah Yang     │ │
│ └──────────────────────────┘ │ │  Maha Pengasih...           │ │
│         ...                  │ │         ...                 │ │
└──────────────────────────────┴─────────────────────────────────┘
```

### Master-Detail Behavior

- Master list scroll independent dari detail panel
- Klik item di master langsung update detail (tanpa loading page)
- URL sync tetap update untuk sharing/bookmark
- Empty state di detail: "Pilih surah untuk mulai membaca"
- Keyboard navigation: Arrow up/down untuk navigate list

## Halaman-Halaman

### Home / Beranda

Dashboard grid dengan widget:
- Terakhir Dibaca (quick resume)
- Waktu Shalat Hari Ini
- Imsakiyah (jika Ramadhan)
- Doa Pilihan
- Jelajahi Al-Quran (grid 4 kolom)

### Waktu Shalat

- Horizontal card layout untuk 5 waktu shalat
- Highlight waktu shalat berikutnya
- Countdown timer

### Imsakiyah

- 2-column cards untuk Hari Ini + Besok
- Full table untuk jadwal sebulan
- Highlight hari ini

### Settings

- 2-column grid untuk kategori pengaturan
- Tampilan, Bacaan, Lokasi

## Micro-interactions

### Card Hover (Desktop)

```css
.surah-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: hsl(var(--primary) / 0.3);
}
```

### Active State

```css
.master-item.active {
  background: hsl(var(--primary) / 0.1);
  border-left: 3px solid hsl(var(--primary));
}
```

### Transitions

| Element | Transition |
|---------|------------|
| Sidebar collapse | `width 200ms ease-out` |
| Card hover | `transform 150ms, shadow 150ms` |
| Page navigation | `opacity 150ms fade` |
| Modal open | `scale 200ms spring` |
| Detail panel content | `opacity 100ms` on change |

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── ResponsiveLayout.tsx
│   │   ├── MasterDetailLayout.tsx
│   │   ├── Header.tsx (update)
│   │   └── BottomNav.tsx (update)
│   │
│   ├── surah/
│   │   ├── SurahList.tsx
│   │   └── SurahDetail.tsx
│   │
│   ├── doa/
│   │   ├── DoaList.tsx
│   │   └── DoaDetail.tsx
│   │
│   └── home/
│       ├── DashboardGrid.tsx
│       ├── QuickAccessCard.tsx
│       └── PrayerTimesWidget.tsx
│
├── hooks/
│   └── useSidebarState.ts
│
└── pages/ (updates)
```

## CSS Variables

```css
:root {
  --sidebar-width: 240px;
  --sidebar-collapsed: 64px;
  --master-width: 360px;
  --header-height: 64px;
  --bottom-nav-height: 64px;
}
```

## Prioritas Implementasi

| Fase | Komponen | Deskripsi |
|------|----------|-----------|
| 1 | `ResponsiveLayout` + `AppSidebar` | Foundation layout system |
| 2 | Update `Header` + `BottomNav` | Responsive navigation |
| 3 | `MasterDetailLayout` | Split view container |
| 4 | Update `SurahPage` | Master-detail untuk Quran |
| 5 | Update `DoaPage` | Master-detail untuk Doa |
| 6 | Update `Index` (Home) | Dashboard grid layout |
| 7 | Update halaman lain | Shalat, Imsakiyah, Settings |
| 8 | Polish | Hover states, transitions, micro-interactions |

## Tailwind Breakpoints

```typescript
// tailwind.config.ts
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet - TopNav mulai muncul
  'lg': '1024px',  // Desktop - Sidebar + Master-Detail
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```
