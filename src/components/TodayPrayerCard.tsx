import { useMemo } from "react";
import { ShalatJadwal, PRAYER_NAMES, PRAYER_ICONS } from "@/types/shalat";
import { Clock } from "lucide-react";

interface TodayPrayerCardProps {
  jadwal: ShalatJadwal;
  currentTime: Date;
}

export const TodayPrayerCard = ({ jadwal, currentTime }: TodayPrayerCardProps) => {
  // Determine which prayer time is next/current
  const currentPrayerInfo = useMemo(() => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    const prayerTimes = [
      { name: "subuh", time: jadwal.subuh, icon: PRAYER_ICONS.subuh },
      { name: "dzuhur", time: jadwal.dzuhur, icon: PRAYER_ICONS.dzuhur },
      { name: "ashar", time: jadwal.ashar, icon: PRAYER_ICONS.ashar },
      { name: "maghrib", time: jadwal.maghrib, icon: PRAYER_ICONS.maghrib },
      { name: "isya", time: jadwal.isya, icon: PRAYER_ICONS.isya },
    ];

    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    // Find current/next prayer
    for (let i = 0; i < prayerTimes.length; i++) {
      const prayerMinutes = timeToMinutes(prayerTimes[i].time);
      if (now < prayerMinutes) {
        return { current: prayerTimes[i], previous: i > 0 ? prayerTimes[i - 1] : null };
      }
    }

    // After Isya, next is tomorrow's Subuh
    return { current: null, previous: prayerTimes[4] };
  }, [jadwal, currentTime]);

  const allPrayerTimes = [
    { key: "imsak", label: PRAYER_NAMES.imsak, time: jadwal.imsak, icon: PRAYER_ICONS.imsak },
    { key: "subuh", label: PRAYER_NAMES.subuh, time: jadwal.subuh, icon: PRAYER_ICONS.subuh },
    { key: "terbit", label: PRAYER_NAMES.terbit, time: jadwal.terbit, icon: PRAYER_ICONS.terbit },
    { key: "dhuha", label: PRAYER_NAMES.dhuha, time: jadwal.dhuha, icon: PRAYER_ICONS.dhuha },
    { key: "dzuhur", label: PRAYER_NAMES.dzuhur, time: jadwal.dzuhur, icon: PRAYER_ICONS.dzuhur },
    { key: "ashar", label: PRAYER_NAMES.ashar, time: jadwal.ashar, icon: PRAYER_ICONS.ashar },
    { key: "maghrib", label: PRAYER_NAMES.maghrib, time: jadwal.maghrib, icon: PRAYER_ICONS.maghrib },
    { key: "isya", label: PRAYER_NAMES.isya, time: jadwal.isya, icon: PRAYER_ICONS.isya },
  ];

  return (
    <div className="space-y-4">
      {/* Today's Date Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">Jadwal Hari Ini</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">{jadwal.hari}</h2>
          <p className="text-sm opacity-90">{jadwal.tanggal_lengkap}</p>
        </div>
      </div>

      {/* Next Prayer Highlight */}
      {currentPrayerInfo.current && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-accent/20 via-accent/10 to-background p-5 border-2 border-accent/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">
                  🔔 Waktu Shalat Selanjutnya
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {PRAYER_NAMES[currentPrayerInfo.current.name as keyof typeof PRAYER_NAMES]}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-bold text-primary tabular-nums">
                  {currentPrayerInfo.current.time}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Prayer Times Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {allPrayerTimes.map((prayer) => {
          const isNext = currentPrayerInfo.current?.name === prayer.key;
          const isPrevious = currentPrayerInfo.previous?.name === prayer.key;

          return (
            <div
              key={prayer.key}
              className={`relative overflow-hidden rounded-lg p-4 transition-all ${
                isNext
                  ? "bg-accent/20 border-2 border-accent shadow-md scale-105"
                  : isPrevious
                  ? "bg-primary/5 border border-primary/30"
                  : "bg-card border border-border hover:border-primary/20"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-2xl">{prayer.icon}</span>
                <div className="space-y-1">
                  <p className={`text-xs sm:text-sm font-medium ${
                    isNext ? "text-accent-foreground" : "text-muted-foreground"
                  }`}>
                    {prayer.label}
                  </p>
                  <p className={`text-lg sm:text-xl font-bold tabular-nums ${
                    isNext ? "text-accent-foreground" : "text-foreground"
                  }`}>
                    {prayer.time}
                  </p>
                </div>
                {isNext && (
                  <div className="absolute top-1 right-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                      Next
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
