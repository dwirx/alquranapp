// Types for eQuran.id API v2

export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: "Mekah" | "Madinah";
  arti: string;
  deskripsi: string;
  audioFull: AudioQari;
}

export interface SurahDetail extends Surah {
  ayat: Ayat[];
  suratSelanjutnya: SurahNav | null;
  suratSebelumnya: SurahNav | null;
}

export interface SurahNav {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: AudioQari;
}

export interface AudioQari {
  "01": string; // Abdullah Al-Juhany
  "02": string; // Abdul Muhsin Al-Qasim
  "03": string; // Abdurrahman As-Sudais
  "04": string; // Ibrahim Al-Dossari
  "05": string; // Misyari Rasyid Al-Afasy
}

export interface Tafsir {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  tafsir: TafsirAyat[];
}

export interface TafsirAyat {
  ayat: number;
  teks: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const QARI_LIST = [
  { id: "01", name: "Abdullah Al-Juhany" },
  { id: "02", name: "Abdul Muhsin Al-Qasim" },
  { id: "03", name: "Abdurrahman As-Sudais" },
  { id: "04", name: "Ibrahim Al-Dossari" },
  { id: "05", name: "Misyari Rasyid Al-Afasy" },
] as const;

export type QariId = "01" | "02" | "03" | "04" | "05";
