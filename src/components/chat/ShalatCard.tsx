import { Link } from "react-router-dom";
import { Clock, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchShalatScheduleMonthly } from "@/services/shalatApi";
import { PRAYER_ICONS } from "@/types/shalat";
import { cn } from "@/lib/utils";

interface ShalatCardProps {
  className?: string;
}

const ShalatCard = ({ className }: ShalatCardProps) => {
  // Get saved location from localStorage or use default
  const savedProvinsi = localStorage.getItem("shalat_provinsi") || "DKI JAKARTA";
  const savedKabkota = localStorage.getItem("shalat_kabkota") || "KOTA JAKARTA PUSAT";

  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ["shalat", savedProvinsi, savedKabkota],
    queryFn: () => fetchShalatScheduleMonthly(savedProvinsi, savedKabkota),
    staleTime: 1000 * 60 * 60, // 1 hour
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

  if (isLoading) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-500/5 p-4", className)}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          <span className="text-sm text-muted-foreground">Memuat jadwal sholat...</span>
        </div>
      </div>
    );
  }

  if (error || !todaySchedule) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-500/5 p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">
              Jadwal sholat tidak tersedia
            </span>
          </div>
          <Link to="/shalat">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Atur Lokasi
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
              {savedKabkota}
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
