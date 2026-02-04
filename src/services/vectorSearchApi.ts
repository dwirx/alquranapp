import { VectorSearchRequest, VectorSearchResponse } from "@/types/chat";

const VECTOR_API_URL = "https://equran.id/api/vector";

export async function searchQuranVector(
  query: string,
  options?: {
    limit?: number;
    types?: ("ayat" | "tafsir" | "surat" | "doa")[];
    minScore?: number;
  }
): Promise<VectorSearchResponse> {
  const request: VectorSearchRequest = {
    cari: query,
    batas: options?.limit ?? 5,
    tipe: options?.types ?? ["ayat", "tafsir"],
    skorMin: options?.minScore ?? 0.5,
  };

  const response = await fetch(VECTOR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Vector search failed: ${response.status}`);
  }

  return response.json();
}

// Format vector search results for LLM context
export function formatVectorResultsForContext(
  results: VectorSearchResponse
): string {
  if (!results.hasil || results.hasil.length === 0) {
    return "Tidak ada ayat relevan ditemukan.";
  }

  const formatted = results.hasil.map((result, index) => {
    if (result.tipe === "ayat") {
      const data = result.data as {
        id_surat: number;
        nama_surat: string;
        nomor_ayat: number;
        teks_arab: string;
        teks_latin: string;
        terjemahan_id: string;
      };
      return `[${index + 1}] ${data.nama_surat} (${data.id_surat}):${data.nomor_ayat}
Arab: ${data.teks_arab}
Latin: ${data.teks_latin}
Terjemahan: ${data.terjemahan_id}
Relevansi: ${result.relevansi} (${(result.skor * 100).toFixed(0)}%)`;
    } else if (result.tipe === "tafsir") {
      const data = result.data as {
        id_surat: number;
        nama_surat: string;
        nomor_ayat: number;
        isi: string;
      };
      return `[${index + 1}] Tafsir ${data.nama_surat}:${data.nomor_ayat}
${data.isi.substring(0, 500)}...
Relevansi: ${result.relevansi} (${(result.skor * 100).toFixed(0)}%)`;
    }
    return "";
  });

  return formatted.filter(Boolean).join("\n\n");
}
