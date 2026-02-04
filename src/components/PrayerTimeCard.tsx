import { ShalatJadwal, PRAYER_NAMES, PRAYER_ICONS } from "@/types/shalat";
import { Clock, Bell } from "lucide-react";
import { useState, useEffect } from "react";

interface PrayerTimeCardProps {
  jadwal: ShalatJadwal;
}

export function PrayerTimeCard({ jadwal }: PrayerTimeCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerTimes = [
    { key: "imsak", time: jadwal.imsak },
    { key: "subuh", time: jadwal.subuh },
    { key: "terbit", time: jadwal.terbit },
    { key: "dhuha", time: jadwal.dhuha },
    { key: "dzuhur", time: jadwal.dzuhur },
    { key: "ashar", time: jadwal.ashar },
    { key: "maghrib", time: jadwal.maghrib },
    { key: "isya", time: jadwal.isya },
  ];

  // Find current/next prayer
  const getCurrentPrayer = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    for (let i = prayerTimes.length - 1; i >= 0; i--) {
      const [hours, minutes] = prayerTimes[i].time.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;
      if (now >= prayerMinutes) {
        return prayerTimes[i].key;
      }
    }
    return "isya"; // If before imsak, still showing isya from previous day
  };

  const getNextPrayer = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    for (let i = 0; i < prayerTimes.length; i++) {
      const [hours, minutes] = prayerTimes[i].time.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;
      if (now < prayerMinutes) {
        return { ...prayerTimes[i], minutesLeft: prayerMinutes - now };
      }
    }
    // After isya, next is imsak tomorrow
    const [hours, minutes] = prayerTimes[0].time.split(":").map(Number);
    const prayerMinutes = hours * 60 + minutes;
    return { ...prayerTimes[0], minutesLeft: (24 * 60 - now) + prayerMinutes };
  };

  const currentPrayer = getCurrentPrayer();
  const nextPrayer = getNextPrayer();

  const formatTimeLeft = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} jam ${mins} menit`;
    }
    return `${mins} menit`;
  };

  return (
    <div className="space-y-4">
      {/* Next Prayer Highlight */}
      {nextPrayer && (
        <div className="islamic-border bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Waktu shalat berikutnya</p>
              <h3 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                <span>{PRAYER_ICONS[nextPrayer.key]}</span>
                {PRAYER_NAMES[nextPrayer.key]}
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                {nextPrayer.time}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatTimeLeft(nextPrayer.minutesLeft)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">lagi</p>
            </div>
          </div>
        </div>
      )}

      {/* All Prayer Times Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {prayerTimes.map(({ key, time }) => {
          const isCurrent = key === currentPrayer;
          const isNext = key === nextPrayer?.key;
          
          return (
            <div
              key={key}
              className={`
                relative rounded-xl p-3 sm:p-4 border transition-all
                ${isNext 
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                  : isCurrent 
                    ? 'bg-accent/20 border-accent' 
                    : 'bg-card border-border hover:border-primary/30'
                }
              `}
            >
              {isNext && (
                <div className="absolute -top-2 -right-2">
                  <Bell className="h-5 w-5 text-quran-gold animate-pulse" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{PRAYER_ICONS[key]}</span>
                <span className={`text-xs sm:text-sm font-medium ${isNext ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {PRAYER_NAMES[key]}
                </span>
              </div>
              <p className={`text-lg sm:text-xl font-bold ${isNext ? 'text-primary-foreground' : 'text-foreground'}`}>
                {time}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
