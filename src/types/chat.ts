// Chat Message Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  thinking?: string;
  quranRefs?: QuranReference[];
  isStreaming?: boolean;
}

// Quran Reference extracted from response
export interface QuranReference {
  surah: number;
  surahName?: string;
  ayat: string; // "23" or "23-24" for range
  arabic: string;
  latin?: string;
  translation?: string;
  isValid: boolean;
}

// Vector Search Types
export interface VectorSearchRequest {
  cari: string;
  batas?: number;
  tipe?: ("ayat" | "tafsir" | "surat" | "doa")[];
  skorMin?: number;
}

export interface VectorSearchResponse {
  status: string;
  cari: string;
  jumlah: number;
  hasil: VectorSearchResult[];
}

export interface VectorSearchResult {
  tipe: "ayat" | "tafsir" | "surat" | "doa";
  skor: number;
  relevansi: "tinggi" | "sedang" | "rendah";
  data: AyatVectorData | TafsirVectorData | SuratVectorData | DoaVectorData;
}

export interface AyatVectorData {
  id_surat: number;
  nama_surat: string;
  nama_surat_arab: string;
  nomor_ayat: number;
  teks_arab: string;
  teks_latin: string;
  terjemahan_id: string;
}

export interface TafsirVectorData {
  id_surat: number;
  nama_surat: string;
  nomor_ayat: number;
  isi: string;
}

export interface SuratVectorData {
  nomor: number;
  nama: string;
  nama_arab: string;
  arti: string;
  tempat_turun: string;
  jumlah_ayat: number;
  deskripsi: string;
}

export interface DoaVectorData {
  id: number;
  nama: string;
  arab: string;
  latin: string;
  arti: string;
  sumber: string;
}

// Chat Session for history
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// AI Chat API Types
export interface AiChatRequest {
  messages: { role: string; content: string }[];
  context?: string;
}

export interface StreamChunk {
  choices: {
    delta: {
      content?: string;
      reasoning_content?: string;
    };
    finish_reason?: string;
  }[];
}
