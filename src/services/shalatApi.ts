import { ApiResponse, ShalatCity, ShalatScheduleDaily, ShalatScheduleMonthly } from "@/types/shalat";

const BASE_URL = "https://equran.id/api/v2/shalat";

export async function fetchShalatCities(): Promise<ShalatCity[]> {
  const response = await fetch(`${BASE_URL}/kota/semua`);
  if (!response.ok) {
    throw new Error("Failed to fetch cities");
  }
  const data: ApiResponse<ShalatCity[]> = await response.json();
  return data.data;
}

export async function fetchShalatScheduleDaily(
  cityId: string,
  year: number,
  month: number,
  day: number
): Promise<ShalatScheduleDaily> {
  const monthStr = month.toString().padStart(2, "0");
  const dayStr = day.toString().padStart(2, "0");
  const response = await fetch(`${BASE_URL}/jadwal/${cityId}/${year}/${monthStr}/${dayStr}`);
  if (!response.ok) {
    throw new Error("Failed to fetch daily prayer schedule");
  }
  const data: ApiResponse<ShalatScheduleDaily> = await response.json();
  return data.data;
}

export async function fetchShalatScheduleMonthly(
  cityId: string,
  year: number,
  month: number
): Promise<ShalatScheduleMonthly> {
  const monthStr = month.toString().padStart(2, "0");
  const response = await fetch(`${BASE_URL}/jadwal/${cityId}/${year}/${monthStr}`);
  if (!response.ok) {
    throw new Error("Failed to fetch monthly prayer schedule");
  }
  const data: ApiResponse<ShalatScheduleMonthly> = await response.json();
  return data.data;
}

export async function searchShalatCity(keyword: string): Promise<ShalatCity[]> {
  const response = await fetch(`${BASE_URL}/kota/cari/${encodeURIComponent(keyword)}`);
  if (!response.ok) {
    throw new Error("Failed to search cities");
  }
  const data: ApiResponse<ShalatCity[]> = await response.json();
  return data.data;
}
