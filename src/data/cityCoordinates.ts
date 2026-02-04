// Approximate coordinates for major Indonesian cities
// These coordinates are used for geolocation matching
export const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "1301": { lat: -6.2088, lon: 106.8456 }, // Jakarta
  "1501": { lat: -6.9175, lon: 107.6191 }, // Bandung
  "1609": { lat: -7.2575, lon: 112.7521 }, // Surabaya
  "2401": { lat: -6.9932, lon: 110.4203 }, // Semarang
  "1208": { lat: 3.5952, lon: 98.6722 },   // Medan
  "2101": { lat: -5.1477, lon: 119.4327 }, // Makassar
  "1438": { lat: -7.7956, lon: 110.3695 }, // Yogyakarta
  "1819": { lat: -2.9761, lon: 104.7754 }, // Palembang
  "1101": { lat: 5.5483, lon: 95.3238 },   // Banda Aceh
  "1201": { lat: 2.3333, lon: 99.0667 },   // Tanjung Balai
  "1204": { lat: 3.3274, lon: 99.1324 },   // Pematang Siantar
  "1207": { lat: 1.7500, lon: 98.7833 },   // Sibolga
  "1302": { lat: -6.1180, lon: 106.1533 }, // Kabupaten Tangerang
  "1303": { lat: -6.3003, lon: 106.6394 }, // Kabupaten Bekasi
  "1308": { lat: -6.1152, lon: 106.1503 }, // Kota Tangerang
  "1309": { lat: -6.2384, lon: 106.9824 }, // Kota Bekasi
  "1310": { lat: -6.4025, lon: 106.7942 }, // Depok
  "1401": { lat: -6.6026, lon: 106.8055 }, // Bogor
  "1502": { lat: -6.8649, lon: 107.5429 }, // Cimahi
  "1503": { lat: -7.3306, lon: 108.2195 }, // Tasikmalaya
  "1504": { lat: -6.7329, lon: 108.5520 }, // Cirebon
  "1603": { lat: -7.4306, lon: 109.2478 }, // Tegal
  "1605": { lat: -6.8894, lon: 109.6753 }, // Pekalongan
  "1608": { lat: -7.0180, lon: 110.4208 }, // Salatiga
  "1610": { lat: -7.6145, lon: 110.7122 }, // Surakarta/Solo
  "1611": { lat: -6.7378, lon: 111.0410 }, // Kudus
  "1701": { lat: -8.6500, lon: 115.2167 }, // Denpasar
  "1801": { lat: -5.4295, lon: 105.2610 }, // Bandar Lampung
  "1901": { lat: -0.9492, lon: 100.3543 }, // Padang
  "2001": { lat: 0.5071, lon: 101.4478 },  // Pekanbaru
  "2102": { lat: -5.4472, lon: 122.1768 }, // Kendari
  "2103": { lat: -0.8917, lon: 119.8707 }, // Palu
  "2201": { lat: 1.4748, lon: 124.8428 },  // Manado
  "2301": { lat: -3.3199, lon: 114.5907 }, // Banjarmasin
  "2302": { lat: -1.2379, lon: 116.8529 }, // Balikpapan
  "2303": { lat: -0.4917, lon: 117.1535 }, // Samarinda
  "2304": { lat: 0.1170, lon: 109.3417 },  // Pontianak
  "2305": { lat: -2.2101, lon: 113.9197 }, // Palangkaraya
  "2501": { lat: -2.5916, lon: 140.6689 }, // Jayapura
  "2601": { lat: -3.6553, lon: 128.1921 }, // Ambon
  "2701": { lat: 1.1259, lon: 104.0306 },  // Batam
  "2702": { lat: 0.9130, lon: 104.4600 },  // Tanjung Pinang
  "2801": { lat: -1.6101, lon: 103.6131 }, // Jambi
  "2901": { lat: -4.0096, lon: 103.2610 }, // Bengkulu
  "3001": { lat: -8.5846, lon: 116.1165 }, // Mataram
  "3101": { lat: -10.1718, lon: 123.6070 }, // Kupang
};

// Major Indonesian cities with their typical search terms for fuzzy matching
export const CITY_KEYWORDS: Record<string, string[]> = {
  "1301": ["jakarta", "dki", "ibukota"],
  "1501": ["bandung", "priangan"],
  "1609": ["surabaya", "sby"],
  "2401": ["semarang", "smg"],
  "1208": ["medan", "mdn"],
  "2101": ["makassar", "ujung pandang", "sulsel"],
  "1438": ["yogyakarta", "jogja", "yogya", "diy"],
  "1819": ["palembang", "sumsel"],
  "1610": ["surakarta", "solo"],
  "1701": ["denpasar", "bali"],
  "2001": ["pekanbaru", "riau"],
  "2303": ["samarinda", "kaltim"],
  "2304": ["pontianak", "kalbar"],
  "2201": ["manado", "sulut"],
  "2301": ["banjarmasin", "kalsel"],
  "1801": ["lampung", "bandar lampung"],
  "1901": ["padang", "sumbar"],
  "2801": ["jambi"],
  "2701": ["batam", "kepri"],
};
