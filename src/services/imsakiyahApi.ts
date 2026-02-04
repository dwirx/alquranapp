import { ProvinsiResponse, KabKotaResponse, ImsakiyahResponse } from "@/types/imsakiyah";

const BASE_URL = "https://equran.id/api/v2/imsakiyah";

/**
 * Mengambil daftar semua provinsi
 * GET /api/v2/imsakiyah/provinsi
 */
export async function fetchProvinsiImsakiyah(): Promise<ProvinsiResponse> {
  const response = await fetch(`${BASE_URL}/provinsi`);

  if (!response.ok) {
    throw new Error("Failed to fetch provinsi list");
  }

  return response.json();
}

/**
 * Mengambil daftar kabupaten/kota berdasarkan provinsi
 * POST /api/v2/imsakiyah/kabkota
 */
export async function fetchKabKotaImsakiyah(provinsi: string): Promise<KabKotaResponse> {
  const response = await fetch(`${BASE_URL}/kabkota`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ provinsi }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch kabupaten/kota for ${provinsi}`);
  }

  return response.json();
}

/**
 * Mengambil jadwal imsakiyah lengkap
 * POST /api/v2/imsakiyah
 */
export async function fetchImsakiyah(
  provinsi: string,
  kabkota: string
): Promise<ImsakiyahResponse> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ provinsi, kabkota }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch imsakiyah schedule for ${kabkota}, ${provinsi}`);
  }

  return response.json();
}
