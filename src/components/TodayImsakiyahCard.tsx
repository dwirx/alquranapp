import { useState, useEffect } from "react";
import { ImsakiyahDay } from "@/types/imsakiyah";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, TrendingUp } from "lucide-react";

interface TodayImsakiyahCardProps {
  todaySchedule: ImsakiyahDay | null;
  currentDay: number;
  provinsi: string;
  kabkota: string;
}

export const TodayImsakiyahCard = ({
  todaySchedule,
  currentDay,
  provinsi,
  kabkota,
}: TodayImsakiyahCardProps) => {
  const [countdown, setCountdown] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<string>("");

  useEffect(() => {
    if (!todaySchedule) return;

    const updateCountdown = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();

      const currentTimeInSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;

      // Parse Imsak and Subuh times
      const [imsakHour, imsakMinute] = todaySchedule.imsak.split(":").map(Number);
      const [subuhHour, subuhMinute] = todaySchedule.subuh.split(":").map(Number);

      const imsakTimeInSeconds = imsakHour * 3600 + imsakMinute * 60;
      const subuhTimeInSeconds = subuhHour * 3600 + subuhMinute * 60;

      let targetTime = 0;
      let prayerName = "";

      if (currentTimeInSeconds < imsakTimeInSeconds) {
        // Before Imsak
        targetTime = imsakTimeInSeconds;
        prayerName = "Imsak";
      } else if (currentTimeInSeconds < subuhTimeInSeconds) {
        // Between Imsak and Subuh
        targetTime = subuhTimeInSeconds;
        prayerName = "Subuh";
      } else {
        // After Subuh - show next day's Imsak
        targetTime = imsakTimeInSeconds + 24 * 3600; // Tomorrow's Imsak
        prayerName = "Imsak (Besok)";
      }

      const diff = targetTime - currentTimeInSeconds;

      if (diff > 0) {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        if (hours > 0) {
          setCountdown(`${hours} jam ${minutes} menit ${seconds} detik`);
        } else if (minutes > 0) {
          setCountdown(`${minutes} menit ${seconds} detik`);
        } else {
          setCountdown(`${seconds} detik`);
        }
        setNextPrayer(prayerName);
      } else {
        setCountdown("Sudah lewat waktu Subuh");
        setNextPrayer("");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [todaySchedule]);

  if (!todaySchedule) {
    return null;
  }

  const progressPercentage = (currentDay / 30) * 100;

  const prayerTimes = [
    { label: "Imsak", time: todaySchedule.imsak, highlight: true },
    { label: "Subuh", time: todaySchedule.subuh, highlight: true },
    { label: "Terbit", time: todaySchedule.terbit, highlight: false },
    { label: "Dhuha", time: todaySchedule.dhuha, highlight: false },
    { label: "Dzuhur", time: todaySchedule.dzuhur, highlight: false },
    { label: "Ashar", time: todaySchedule.ashar, highlight: false },
    { label: "Maghrib", time: todaySchedule.maghrib, highlight: false },
    { label: "Isya", time: todaySchedule.isya, highlight: false },
  ];

  return (
    <Card className="p-6 sm:p-8 lg:p-10 border-2 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Ramadhan 1447H / 2026M</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Hari ke-{currentDay}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {kabkota}, {provinsi}
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2 sm:min-w-[200px]">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Progress Ramadhan</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {currentDay} dari 30 hari
            </p>
          </div>
        </div>

        {/* Countdown Section */}
        {nextPrayer && (
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Waktu {nextPrayer} dalam
                </p>
              </div>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tabular-nums">
              {countdown}
            </p>
          </div>
        )}

        {/* Prayer Times Grid */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
            Jadwal Waktu Shalat Hari Ini
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {prayerTimes.map((prayer) => (
              <div
                key={prayer.label}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  prayer.highlight
                    ? "bg-primary/10 border-primary/30 shadow-md"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  {prayer.label}
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold tabular-nums ${
                    prayer.highlight ? "text-primary" : "text-foreground"
                  }`}
                >
                  {prayer.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
