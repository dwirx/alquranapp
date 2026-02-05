import { Link } from "react-router-dom";
import { ExternalLink, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchImsakiyah, fetchProvinsiImsakiyah, fetchKabKotaImsakiyah } from "@/services/imsakiyahApi";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ImsakiyahCardProps {
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
  "bandung": { provinsi: "JAWA BARAT", kabkota: "KOTA BANDUNG" },
  "semarang": { provinsi: "JAWA TENGAH", kabkota: "KOTA SEMARANG" },
  "yogyakarta": { provinsi: "DI YOGYAKARTA", kabkota: "KOTA YOGYAKARTA" },
  "jogja": { provinsi: "DI YOGYAKARTA", kabkota: "KOTA YOGYAKARTA" },
  "medan": { provinsi: "SUMATERA UTARA", kabkota: "KOTA MEDAN" },
  "makassar": { provinsi: "SULAWESI SELATAN", kabkota: "KOTA MAKASSAR" },
  "denpasar": { provinsi: "BALI", kabkota: "KOTA DENPASAR" },
  "bali": { provinsi: "BALI", kabkota: "KOTA DENPASAR" },
};

const ImsakiyahCard = ({ provinsi: propProvinsi, kabkota: propKabkota, className }: ImsakiyahCardProps) => {
  const [resolvedLocation, setResolvedLocation] = useState<{ provinsi: string; kabkota: string } | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Resolve location from props or localStorage
  useEffect(() => {
    const resolveLocation = async () => {
      if (propKabkota || propProvinsi) {
        setIsResolving(true);

        const searchKey = (propKabkota || propProvinsi || "").toLowerCase().trim();
        if (CITY_ALIASES[searchKey]) {
          setResolvedLocation(CITY_ALIASES[searchKey]);
          setIsResolving(false);
          return;
        }

        try {
          if (propProvinsi && propKabkota) {
            setResolvedLocation({
              provinsi: propProvinsi.toUpperCase(),
              kabkota: propKabkota.toUpperCase(),
            });
          } else if (propKabkota) {
            const provResponse = await fetchProvinsiImsakiyah();
            for (const prov of provResponse.data) {
              try {
                const citiesResponse = await fetchKabKotaImsakiyah(prov);
                const matchedCity = citiesResponse.data.find(
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
          console.warn("[ImsakiyahCard] Failed to resolve location:", error);
        }

        setIsResolving(false);
      }
    };

    resolveLocation();
  }, [propProvinsi, propKabkota]);

  const finalProvinsi = resolvedLocation?.provinsi || localStorage.getItem("imsakiyah_provinsi") || "DKI JAKARTA";
  const finalKabkota = resolvedLocation?.kabkota || localStorage.getItem("imsakiyah_kabkota") || "KOTA JAKARTA PUSAT";

  const { data: imsakiyah, isLoading, error } = useQuery({
    queryKey: ["imsakiyah", finalProvinsi, finalKabkota],
    queryFn: () => fetchImsakiyah(finalProvinsi, finalKabkota),
    staleTime: 1000 * 60 * 60,
    enabled: !isResolving,
  });

  const today = new Date();
  const todaySchedule = imsakiyah?.data?.imsakiyah?.find(
    (i) => i.tanggal === today.getDate()
  );

  if (isLoading || isResolving) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-purple-500 bg-purple-500/5 p-4", className)}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          <span className="text-sm text-muted-foreground">
            {isResolving ? `Mencari lokasi ${propKabkota || propProvinsi}...` : "Memuat jadwal imsakiyah..."}
          </span>
        </div>
      </div>
    );
  }

  if (error || !todaySchedule || !imsakiyah?.data) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-purple-500 bg-purple-500/5 p-4", className)}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <span className="text-sm text-muted-foreground">
              Jadwal imsakiyah untuk "{propKabkota || propProvinsi || finalKabkota}" tidak tersedia
            </span>
          </div>
          <Link to="/imsakiyah">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Pilih Lokasi
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
            {finalKabkota}
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
