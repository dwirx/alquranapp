// Types for eQuran.id Shalat/Prayer Times API

export interface ShalatCity {
  id: string;
  lokasi: string;
}

export interface ShalatJadwal {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  date?: string;
}

export interface ShalatScheduleDaily {
  id: string;
  lokasi: string;
  daerah: string;
  jadwal: ShalatJadwal;
}

export interface ShalatScheduleMonthly {
  id: string;
  lokasi: string;
  daerah: string;
  koordinat: {
    lat: number;
    lon: number;
    lintang: string;
    bujur: string;
  };
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
