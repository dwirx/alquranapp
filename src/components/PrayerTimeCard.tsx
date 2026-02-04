import { ShalatJadwal, PRAYER_NAMES } from "@/types/shalat";
import { Clock, Bell, Sunrise, Sunset, Sun, Moon, CloudSun } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
    { key: "imsak", time: jadwal.imsak, icon: Moon, color: "from-slate-600 to-slate-800" },
    { key: "subuh", time: jadwal.subuh, icon: Sunrise, color: "from-indigo-500 to-purple-600" },
    { key: "terbit", time: jadwal.terbit, icon: Sun, color: "from-orange-400 to-amber-500" },
    { key: "dhuha", time: jadwal.dhuha, icon: Sun, color: "from-yellow-400 to-orange-400" },
    { key: "dzuhur", time: jadwal.dzuhur, icon: Sun, color: "from-sky-400 to-blue-500" },
    { key: "ashar", time: jadwal.ashar, icon: CloudSun, color: "from-cyan-400 to-teal-500" },
    { key: "maghrib", time: jadwal.maghrib, icon: Sunset, color: "from-orange-500 to-rose-600" },
    { key: "isya", time: jadwal.isya, icon: Moon, color: "from-indigo-600 to-slate-800" },
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
    return "isya";
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
      return { hours, mins, text: `${hours}j ${mins}m` };
    }
    return { hours: 0, mins, text: `${mins} menit` };
  };

  const timeLeft = formatTimeLeft(nextPrayer.minutesLeft);
  const NextPrayerIcon = nextPrayer.icon;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Next Prayer Highlight Card */}
      {nextPrayer && (
        <div className={cn(
          "relative overflow-hidden rounded-2xl p-5 sm:p-6 md:p-8",
          "bg-gradient-to-br", nextPrayer.color,
          "text-white shadow-lg"
        )}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 animate-pulse" />
                  <p className="text-sm font-medium text-white/90">Waktu shalat berikutnya</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <NextPrayerIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                  <div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      {PRAYER_NAMES[nextPrayer.key]}
                    </h3>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                      {nextPrayer.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Clock className="h-4 w-4" />
                  <div className="flex items-baseline gap-1">
                    {timeLeft.hours > 0 && (
                      <>
                        <span className="text-2xl sm:text-3xl font-bold">{timeLeft.hours}</span>
                        <span className="text-sm">jam</span>
                      </>
                    )}
                    <span className="text-2xl sm:text-3xl font-bold">{timeLeft.mins}</span>
                    <span className="text-sm">menit</span>
                  </div>
                </div>
                <p className="text-xs text-white/70 mt-1">menuju adzan</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Prayer Times Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {prayerTimes.map(({ key, time, icon: Icon, color }) => {
          const isCurrent = key === currentPrayer;
          const isNext = key === nextPrayer?.key;
          
          return (
            <div
              key={key}
              className={cn(
                "relative rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300",
                "hover:scale-[1.02] hover:shadow-md",
                isNext 
                  ? "bg-gradient-to-br " + color + " border-transparent text-white shadow-lg" 
                  : isCurrent 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-card border-border hover:border-primary/20"
              )}
            >
              {isNext && (
                <div className="absolute -top-1.5 -right-1.5">
                  <div className="relative">
                    <Bell className="h-5 w-5 text-white animate-bounce" />
                    <div className="absolute inset-0 bg-white/50 rounded-full blur-sm animate-ping" />
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Icon className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6",
                  isNext ? "text-white" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs sm:text-sm font-semibold uppercase tracking-wide",
                  isNext ? "text-white/90" : "text-muted-foreground"
                )}>
                  {PRAYER_NAMES[key]}
                </span>
              </div>
              
              <p className={cn(
                "text-2xl sm:text-3xl font-bold tabular-nums",
                isNext ? "text-white" : "text-foreground"
              )}>
                {time}
              </p>

              {isCurrent && !isNext && (
                <div className="absolute bottom-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Prayer Guide */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <div className="w-2 h-2 rounded-full bg-slate-600" />
          <span>Imsak: Waktu berhenti sahur</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Terbit: Matahari terbit</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Dhuha: Waktu shalat Dhuha</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Shalat 5 waktu wajib</span>
        </div>
      </div>
    </div>
  );
}
