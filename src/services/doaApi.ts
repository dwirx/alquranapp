import { DoaApiResponse, DoaDetailResponse } from "@/types/doa";

const BASE_URL = "https://equran.id/api/doa";

/**
 * Mengambil daftar lengkap doa dan dzikir
 * GET /api/doa
 * @param grup - Filter berdasarkan grup/kategori (optional)
 * @param tag - Filter berdasarkan tag (optional)
 */
export async function fetchDoaList(
  grup?: string,
  tag?: string
): Promise<DoaApiResponse> {
  const params = new URLSearchParams();
  if (grup) params.append("grup", grup);
  if (tag) params.append("tag", tag);

  const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch doa list");
  }

  return response.json();
}

/**
 * Mengambil detail doa berdasarkan ID
 * GET /api/doa/{id}
 * @param id - ID doa (1-228)
 */
export async function fetchDoaDetail(id: number): Promise<DoaDetailResponse> {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch doa with ID ${id}`);
  }

  return response.json();
}
