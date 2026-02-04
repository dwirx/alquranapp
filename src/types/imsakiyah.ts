// Types for eQuran.id Imsakiyah API

export interface ImsakiyahDay {
  tanggal: number;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface ImsakiyahData {
  provinsi: string;
  kabkota: string;
  hijriah: string;
  masehi: string;
  imsakiyah: ImsakiyahDay[];
}

export interface ImsakiyahResponse {
  code: number;
  message: string;
  data: ImsakiyahData;
}

export interface ProvinsiResponse {
  code: number;
  message: string;
  data: string[];
}

export interface KabKotaResponse {
  code: number;
  message: string;
  data: string[];
}
