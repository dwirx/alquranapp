import { Link } from "react-router-dom";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchShalatScheduleMonthly, fetchProvinsi, fetchKabKota } from "@/services/shalatApi";
import { PRAYER_ICONS } from "@/types/shalat";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ShalatCardProps {
  provinsi?: string;
  kabkota?: string;
  className?: string;
}

// Map common city names to their official kabkota names
const CITY_ALIASES: Record<string, { provinsi: string; kabkota: string }> = {
  "malang": { provinsi: "JAWA TIMUR", kabkota: "KABUPATEN MALANG" },
  "kota malang": { provinsi: "JAWA TIMUR", kabkota: "KOTA MALANG" },
  "kabupaten malang": { provinsi: "JAWA TIMUR", kabkota: "KABUPATEN MALANG" },
  "kab malang": { provinsi: "JAWA TIMUR", kabkota: "KABUPATEN MALANG" },
  "surabaya": { provinsi: "JAWA TIMUR", kabkota: "KOTA SURABAYA" },
  "jakarta": { provinsi: "DKI JAKARTA", kabkota: "KOTA JAKARTA PUSAT" },
  "jakarta pusat": { provinsi: "DKI JAKARTA", kabkota: "KOTA JAKARTA PUSAT" },
  "jakarta selatan": { provinsi: "DKI JAKARTA", kabkota: "KOTA JAKARTA SELATAN" },
  "jakarta barat": { provinsi: "DKI JAKARTA", kabkota: "KOTA JAKARTA BARAT" },
  "jakarta timur": { provinsi: "DKI JAKARTA", kabkota: "KOTA JAKARTA TIMUR" },
  "jakarta utara": { provinsi: "DKI JAKARTA", kabkota: "KOTA JAKARTA UTARA" },
  "bandung": { provinsi: "JAWA BARAT", kabkota: "KOTA BANDUNG" },
  "semarang": { provinsi: "JAWA TENGAH", kabkota: "KOTA SEMARANG" },
  "yogyakarta": { provinsi: "DI YOGYAKARTA", kabkota: "KOTA YOGYAKARTA" },
  "jogja": { provinsi: "DI YOGYAKARTA", kabkota: "KOTA YOGYAKARTA" },
  "medan": { provinsi: "SUMATERA UTARA", kabkota: "KOTA MEDAN" },
  "makassar": { provinsi: "SULAWESI SELATAN", kabkota: "KOTA MAKASSAR" },
  "palembang": { provinsi: "SUMATERA SELATAN", kabkota: "KOTA PALEMBANG" },
  "denpasar": { provinsi: "BALI", kabkota: "KOTA DENPASAR" },
  "bali": { provinsi: "BALI", kabkota: "KOTA DENPASAR" },
  "bekasi": { provinsi: "JAWA BARAT", kabkota: "KOTA BEKASI" },
  "tangerang": { provinsi: "BANTEN", kabkota: "KOTA TANGERANG" },
  "depok": { provinsi: "JAWA BARAT", kabkota: "KOTA DEPOK" },
  "bogor": { provinsi: "JAWA BARAT", kabkota: "KOTA BOGOR" },
};

const ShalatCard = ({ provinsi: propProvinsi, kabkota: propKabkota, className }: ShalatCardProps) => {
  const [resolvedLocation, setResolvedLocation] = useState<{ provinsi: string; kabkota: string } | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Resolve location from props or localStorage
  useEffect(() => {
    const resolveLocation = async () => {
      // If props provided, try to resolve them
      if (propKabkota || propProvinsi) {
        setIsResolving(true);

        // Check aliases first
        const searchKey = (propKabkota || propProvinsi || "").toLowerCase().trim();
        if (CITY_ALIASES[searchKey]) {
          setResolvedLocation(CITY_ALIASES[searchKey]);
          setIsResolving(false);
          return;
        }

        // Try to find matching city from API
        try {
          if (propProvinsi && propKabkota) {
            setResolvedLocation({
              provinsi: propProvinsi.toUpperCase(),
              kabkota: propKabkota.toUpperCase(),
            });
          } else if (propKabkota) {
            // Search through all provinces for this city
            const provinces = await fetchProvinsi();
            for (const prov of provinces) {
              try {
                const cities = await fetchKabKota(prov);
                const matchedCity = cities.find(
                  (c) => c.toLowerCase().includes(searchKey) || searchKey.includes(c.toLowerCase())
                );
                if (matchedCity) {
                  setResolvedLocation({ provinsi: prov, kabkota: matchedCity });
                  setIsResolving(false);
                  return;
                }
              } catch {
                continue;
              }
            }
          }
        } catch (error) {
          console.warn("[ShalatCard] Failed to resolve location:", error);
        }

        setIsResolving(false);
      }
    };

    resolveLocation();
  }, [propProvinsi, propKabkota]);

  // Final location to use
  const finalProvinsi = resolvedLocation?.provinsi || localStorage.getItem("shalat_provinsi") || "DKI JAKARTA";
  const finalKabkota = resolvedLocation?.kabkota || localStorage.getItem("shalat_kabkota") || "KOTA JAKARTA PUSAT";

  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ["shalat", finalProvinsi, finalKabkota],
    queryFn: () => fetchShalatScheduleMonthly(finalProvinsi, finalKabkota),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !isResolving,
  });

  // Get today's schedule
  const today = new Date();
  const todaySchedule = schedule?.jadwal?.find(
    (j) => j.tanggal === today.getDate()
  );

  // Determine next prayer
  const getNextPrayer = () => {
    if (!todaySchedule) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: "subuh", time: todaySchedule.subuh, icon: PRAYER_ICONS.subuh },
      { name: "terbit", time: todaySchedule.terbit, icon: PRAYER_ICONS.terbit },
      { name: "dzuhur", time: todaySchedule.dzuhur, icon: PRAYER_ICONS.dzuhur },
      { name: "ashar", time: todaySchedule.ashar, icon: PRAYER_ICONS.ashar },
      { name: "maghrib", time: todaySchedule.maghrib, icon: PRAYER_ICONS.maghrib },
      { name: "isya", time: todaySchedule.isya, icon: PRAYER_ICONS.isya },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;
      if (prayerMinutes > currentTime) {
        return prayer.name;
      }
    }

    return "subuh"; // Next day
  };

  const nextPrayer = getNextPrayer();

  if (isLoading || isResolving) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-500/5 p-4", className)}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          <span className="text-sm text-muted-foreground">
            {isResolving ? `Mencari lokasi ${propKabkota || propProvinsi}...` : "Memuat jadwal sholat..."}
          </span>
        </div>
      </div>
    );
  }

  if (error || !todaySchedule) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-500/5 p-4", className)}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕌</span>
            <span className="text-sm text-muted-foreground">
              Jadwal sholat untuk "{propKabkota || propProvinsi || finalKabkota}" tidak ditemukan
            </span>
          </div>
          <Link to="/shalat">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Pilih Lokasi
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const prayers = [
    { key: "subuh", name: "Subuh", time: todaySchedule.subuh, icon: PRAYER_ICONS.subuh },
    { key: "terbit", name: "Terbit", time: todaySchedule.terbit, icon: PRAYER_ICONS.terbit },
    { key: "dzuhur", name: "Dzuhur", time: todaySchedule.dzuhur, icon: PRAYER_ICONS.dzuhur },
    { key: "ashar", name: "Ashar", time: todaySchedule.ashar, icon: PRAYER_ICONS.ashar },
    { key: "maghrib", name: "Maghrib", time: todaySchedule.maghrib, icon: PRAYER_ICONS.maghrib },
    { key: "isya", name: "Isya", time: todaySchedule.isya, icon: PRAYER_ICONS.isya },
  ];

  return (
    <div className={cn("my-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-500/5 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕌</span>
          <div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Waktu Sholat
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {finalKabkota}
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {todaySchedule.hari}, {todaySchedule.tanggal_lengkap}
        </span>
      </div>

      {/* Prayer Times */}
      <div className="p-4 grid grid-cols-3 gap-3">
        {prayers.map((prayer) => {
          const isNext = prayer.key === nextPrayer;
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const [hours, minutes] = prayer.time.split(":").map(Number);
          const prayerMinutes = hours * 60 + minutes;
          const isPassed = prayerMinutes < currentTime;

          return (
            <div
              key={prayer.key}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                isNext && "bg-emerald-500/20 ring-1 ring-emerald-500",
                isPassed && !isNext && "opacity-50"
              )}
            >
              <span className="text-lg">{prayer.icon}</span>
              <span className="text-xs text-muted-foreground">{prayer.name}</span>
              <span className={cn(
                "font-mono font-semibold",
                isNext && "text-emerald-600 dark:text-emerald-400"
              )}>
                {prayer.time}
              </span>
              {isNext && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Berikutnya
                </span>
              )}
              {isPassed && !isNext && (
                <span className="text-[10px] text-muted-foreground">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Link to="/shalat">
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Lihat Detail Lengkap
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ShalatCard;
