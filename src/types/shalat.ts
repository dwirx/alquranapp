// Types for eQuran.id Shalat/Prayer Times API v2 (2026)

export interface ShalatJadwal {
  tanggal: number; // day of month
  tanggal_lengkap: string; // YYYY-MM-DD
  hari: string; // day name in Indonesian
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface ShalatScheduleMonthly {
  provinsi: string;
  kabkota: string;
  bulan: number;
  tahun: number;
  bulan_nama: string;
  jadwal: ShalatJadwal[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Prayer time names in Indonesian
export const PRAYER_NAMES: Record<string, string> = {
  imsak: "Imsak",
  subuh: "Subuh",
  terbit: "Terbit",
  dhuha: "Dhuha",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Maghrib",
  isya: "Isya",
};

// Prayer icons (using time-based logic)
export const PRAYER_ICONS: Record<string, string> = {
  imsak: "🌙",
  subuh: "🌅",
  terbit: "🌄",
  dhuha: "☀️",
  dzuhur: "🌞",
  ashar: "🌤️",
  maghrib: "🌇",
  isya: "🌃",
};
