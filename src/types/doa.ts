// Types for eQuran.id Doa & Dzikir API

export interface Doa {
  id: number;
  nama: string;      // Judul doa
  ar: string;        // Teks Arab
  tr: string;        // Transliterasi Latin
  idn: string;       // Terjemahan Indonesia
  grup?: string;
  tag?: string[];
  tentang?: string;
}

export interface DoaApiResponse {
  data: Doa[];
}

export interface DoaDetailResponse {
  data: Doa;
}
