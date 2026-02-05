import { Link } from "react-router-dom";
import { ExternalLink, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchImsakiyah } from "@/services/imsakiyahApi";
import { cn } from "@/lib/utils";

interface ImsakiyahCardProps {
  className?: string;
}

const ImsakiyahCard = ({ className }: ImsakiyahCardProps) => {
  // Get saved location from localStorage or use default
  const savedProvinsi = localStorage.getItem("imsakiyah_provinsi") || "DKI JAKARTA";
  const savedKabkota = localStorage.getItem("imsakiyah_kabkota") || "KOTA JAKARTA PUSAT";

  const { data: imsakiyah, isLoading, error } = useQuery({
    queryKey: ["imsakiyah", savedProvinsi, savedKabkota],
    queryFn: () => fetchImsakiyah(savedProvinsi, savedKabkota),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Get today's schedule
  const today = new Date();
  const todaySchedule = imsakiyah?.data?.imsakiyah?.find(
    (i) => i.tanggal === today.getDate()
  );

  if (isLoading) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-purple-500 bg-purple-500/5 p-4", className)}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          <span className="text-sm text-muted-foreground">Memuat jadwal imsakiyah...</span>
        </div>
      </div>
    );
  }

  if (error || !todaySchedule || !imsakiyah?.data) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-purple-500 bg-purple-500/5 p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <span className="text-sm text-muted-foreground">
              Jadwal imsakiyah tidak tersedia
            </span>
          </div>
          <Link to="/imsakiyah">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Atur Lokasi
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const scheduleItems = [
    { label: "Imsak", time: todaySchedule.imsak, icon: "🌙" },
    { label: "Subuh", time: todaySchedule.subuh, icon: "🌅" },
    { label: "Berbuka", time: todaySchedule.maghrib, icon: "🌇" },
  ];

  return (
    <div className={cn("my-3 rounded-xl border-l-4 border-purple-500 bg-purple-500/5 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌙</span>
          <div>
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              Jadwal Imsakiyah
            </span>
            <div className="text-xs text-muted-foreground">
              {imsakiyah.data.hijriah}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {savedKabkota}
          </div>
          <div className="text-xs text-muted-foreground">
            Hari ke-{todaySchedule.tanggal}
          </div>
        </div>
      </div>

      {/* Schedule Items */}
      <div className="p-4 grid grid-cols-3 gap-4">
        {scheduleItems.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center p-3 rounded-lg bg-purple-500/10"
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className="font-mono font-bold text-lg text-purple-600 dark:text-purple-400">
              {item.time}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Link to="/imsakiyah">
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Lihat Jadwal Lengkap
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ImsakiyahCard;
