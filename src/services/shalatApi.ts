import { ApiResponse, ShalatScheduleMonthly } from "@/types/shalat";

const BASE_URL = "https://equran.id/api/v2/shalat";

/**
 * Mengambil daftar semua provinsi yang memiliki data jadwal shalat
 * GET /api/v2/shalat/provinsi
 */
export async function fetchProvinsi(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/provinsi`);
  if (!response.ok) {
    throw new Error("Failed to fetch provinces");
  }
  const data: ApiResponse<string[]> = await response.json();
  return data.data;
}

/**
 * Mengambil daftar kabupaten/kota berdasarkan provinsi
 * POST /api/v2/shalat/kabkota
 */
export async function fetchKabKota(provinsi: string): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/kabkota`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ provinsi }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cities");
  }
  const data: ApiResponse<string[]> = await response.json();
  return data.data;
}

/**
 * Mengambil jadwal shalat bulanan untuk kabupaten/kota tertentu
 * POST /api/v2/shalat
 */
export async function fetchShalatScheduleMonthly(
  provinsi: string,
  kabkota: string,
  bulan?: number,
  tahun?: number
): Promise<ShalatScheduleMonthly> {
  const now = new Date();
  const requestBody = {
    provinsi,
    kabkota,
    bulan: bulan ?? now.getMonth() + 1,
    tahun: tahun ?? now.getFullYear(),
  };

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prayer schedule");
  }

  const data: ApiResponse<ShalatScheduleMonthly> = await response.json();
  return data.data;
}
