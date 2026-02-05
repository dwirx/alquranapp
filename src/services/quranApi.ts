import { ApiResponse, Ayat, Surah, SurahDetail, Tafsir } from "@/types/quran";

const BASE_URL = "https://equran.id/api/v2";

export async function fetchAllSurahs(): Promise<Surah[]> {
  const response = await fetch(`${BASE_URL}/surat`);
  if (!response.ok) {
    throw new Error("Failed to fetch surahs");
  }
  const data: ApiResponse<Surah[]> = await response.json();
  return data.data;
}

export async function fetchSurahDetail(nomor: number): Promise<SurahDetail> {
  const response = await fetch(`${BASE_URL}/surat/${nomor}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch surah ${nomor}`);
  }
  const data: ApiResponse<SurahDetail> = await response.json();
  return data.data;
}

export async function fetchTafsir(nomor: number): Promise<Tafsir> {
  const response = await fetch(`${BASE_URL}/tafsir/${nomor}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tafsir for surah ${nomor}`);
  }
  const data: ApiResponse<Tafsir> = await response.json();
  return data.data;
}

export async function fetchAyat(
  surah: number,
  ayat: number
): Promise<Ayat | null> {
  const surahData = await fetchSurahDetail(surah);
  const ayatData = surahData.ayat.find((a) => a.nomorAyat === ayat);
  return ayatData || null;
}

export async function fetchAyatRange(
  surah: number,
  startAyat: number,
  endAyat: number
): Promise<Ayat[]> {
  const surahData = await fetchSurahDetail(surah);
  return surahData.ayat.filter(
    (a) => a.nomorAyat >= startAyat && a.nomorAyat <= endAyat
  );
}
