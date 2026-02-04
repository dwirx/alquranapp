// Popular cities in Indonesia for quick access
export const POPULAR_CITIES = [
  { provinsi: "DKI Jakarta", kabkota: "Kota Jakarta", lat: -6.2088, lon: 106.8456 },
  { provinsi: "Jawa Barat", kabkota: "Kota Bandung", lat: -6.9175, lon: 107.6191 },
  { provinsi: "Jawa Timur", kabkota: "Kota Surabaya", lat: -7.2575, lon: 112.7521 },
  { provinsi: "Jawa Tengah", kabkota: "Kota Semarang", lat: -6.9932, lon: 110.4203 },
  { provinsi: "Sumatera Utara", kabkota: "Kota Medan", lat: 3.5952, lon: 98.6722 },
  { provinsi: "Sulawesi Selatan", kabkota: "Kota Makassar", lat: -5.1477, lon: 119.4327 },
  { provinsi: "DI Yogyakarta", kabkota: "Kota Yogyakarta", lat: -7.7956, lon: 110.3695 },
  { provinsi: "Sumatera Selatan", kabkota: "Kota Palembang", lat: -2.9761, lon: 104.7754 },
  { provinsi: "Jawa Barat", kabkota: "Kota Bogor", lat: -6.5950, lon: 106.8166 },
  { provinsi: "Jawa Barat", kabkota: "Kota Bekasi", lat: -6.2383, lon: 106.9756 },
  { provinsi: "Jawa Timur", kabkota: "Kab. Malang", lat: -8.1661, lon: 112.7072 },
] as const;

// Helper function to calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
