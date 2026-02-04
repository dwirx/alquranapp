import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchShalatCities, fetchShalatScheduleDaily } from "@/services/shalatApi";
import { Header } from "@/components/Header";
import { PrayerTimeCard } from "@/components/PrayerTimeCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { MapPin, Clock, Navigation, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useGeolocation, calculateDistance } from "@/hooks/useGeolocation";
import { CITY_COORDINATES } from "@/data/cityCoordinates";
import { toast } from "sonner";

const POPULAR_CITIES = [
  { id: "1301", lokasi: "KOTA JAKARTA" },
  { id: "1501", lokasi: "KOTA BANDUNG" },
  { id: "1609", lokasi: "KOTA SURABAYA" },
  { id: "2401", lokasi: "KOTA SEMARANG" },
  { id: "1208", lokasi: "KOTA MEDAN" },
  { id: "2101", lokasi: "KOTA MAKASSAR" },
  { id: "1438", lokasi: "KOTA YOGYAKARTA" },
  { id: "1819", lokasi: "KOTA PALEMBANG" },
];

const ShalatPage = () => {
  const [selectedCity, setSelectedCity] = useState<{ id: string; lokasi: string } | null>(null);
  const [openCitySelector, setOpenCitySelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationDetected, setLocationDetected] = useState(false);

  const { loading: geoLoading, error: geoError, position, requestLocation } = useGeolocation();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load saved city from localStorage
  useEffect(() => {
    const savedCity = localStorage.getItem("selectedShalatCity");
    if (savedCity) {
      try {
        setSelectedCity(JSON.parse(savedCity));
      } catch {
        setSelectedCity(POPULAR_CITIES[0]);
      }
    } else {
      setSelectedCity(POPULAR_CITIES[0]);
    }
  }, []);

  // Save city to localStorage
  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem("selectedShalatCity", JSON.stringify(selectedCity));
    }
  }, [selectedCity]);

  // Fetch all cities
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ["shalat-cities"],
    queryFn: fetchShalatCities,
  });

  // Find nearest city when position changes
  useEffect(() => {
    if (position && cities) {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;
      
      let nearestCity: { id: string; lokasi: string } | null = null;
      let minDistance = Infinity;
      
      // Check cities with known coordinates first
      for (const [cityId, coords] of Object.entries(CITY_COORDINATES)) {
        const distance = calculateDistance(userLat, userLon, coords.lat, coords.lon);
        if (distance < minDistance) {
          minDistance = distance;
          const city = cities.find(c => c.id === cityId);
          if (city) {
            nearestCity = city;
          }
        }
      }
      
      if (nearestCity) {
        setSelectedCity(nearestCity);
        setLocationDetected(true);
        toast.success(`Lokasi terdeteksi: ${nearestCity.lokasi}`, {
          description: `Jarak sekitar ${Math.round(minDistance)} km dari lokasi Anda`,
        });
      }
    }
  }, [position, cities]);

  // Show error toast
  useEffect(() => {
    if (geoError) {
      toast.error("Gagal mendeteksi lokasi", {
        description: geoError,
      });
    }
  }, [geoError]);

  // Fetch prayer schedule
  const { data: schedule, isLoading: scheduleLoading, error, refetch } = useQuery({
    queryKey: ["shalat-schedule", selectedCity?.id, currentTime.getFullYear(), currentTime.getMonth() + 1, currentTime.getDate()],
    queryFn: () => fetchShalatScheduleDaily(
      selectedCity!.id,
      currentTime.getFullYear(),
      currentTime.getMonth() + 1,
      currentTime.getDate()
    ),
    enabled: !!selectedCity,
  });

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!cities) return POPULAR_CITIES;
    if (!searchQuery.trim()) return cities.slice(0, 50);
    
    const query = searchQuery.toLowerCase();
    return cities.filter(city => 
      city.lokasi.toLowerCase().includes(query)
    ).slice(0, 30);
  }, [cities, searchQuery]);

  const handleSelectCity = (city: { id: string; lokasi: string }) => {
    setSelectedCity(city);
    setOpenCitySelector(false);
    setSearchQuery("");
    setLocationDetected(false);
  };

  const handleDetectLocation = () => {
    requestLocation();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container flex-1 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4 sm:p-6 md:p-8 border border-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                  🕌 Jadwal Shalat
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                  Waktu shalat akurat untuk seluruh wilayah Indonesia berdasarkan data Kementerian Agama RI
                </p>
              </div>
              
              {/* Current Time */}
              <div className="flex flex-col items-end">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tabular-nums">
                  {format(currentTime, "HH:mm")}
                  <span className="text-lg sm:text-xl text-muted-foreground">
                    :{format(currentTime, "ss")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {format(currentTime, "EEEE, d MMMM yyyy", { locale: localeId })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* City Selector Section */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Pilih Kota/Kabupaten
            </label>
            <Popover open={openCitySelector} onOpenChange={setOpenCitySelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCitySelector}
                  className="w-full justify-between h-12 text-left font-normal hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    {locationDetected && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                    <span className="truncate font-medium">
                      {selectedCity ? selectedCity.lokasi : "Pilih kota..."}
                    </span>
                  </div>
                  <MapPin className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Cari kota atau kabupaten..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      {citiesLoading ? (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Memuat daftar kota...</span>
                        </div>
                      ) : (
                        "Kota tidak ditemukan"
                      )}
                    </CommandEmpty>
                    {!searchQuery && (
                      <CommandGroup heading="🌟 Kota Populer">
                        {POPULAR_CITIES.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.lokasi}
                            onSelect={() => handleSelectCity(city)}
                            className="cursor-pointer"
                          >
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">{city.lokasi}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    <CommandGroup heading={searchQuery ? "📍 Hasil Pencarian" : "🏙️ Semua Kota"}>
                      {filteredCities.map((city) => (
                        <CommandItem
                          key={city.id}
                          value={city.lokasi}
                          onSelect={() => handleSelectCity(city)}
                          className="cursor-pointer"
                        >
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          {city.lokasi}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Location Detection Button */}
          <div className="flex items-end">
            <Button
              onClick={handleDetectLocation}
              disabled={geoLoading}
              variant="secondary"
              className="h-12 px-4 sm:px-6 gap-2 whitespace-nowrap"
            >
              {geoLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Mendeteksi...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  <span className="hidden sm:inline">Deteksi Lokasi</span>
                  <span className="sm:hidden">Lokasi</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Prayer Schedule Content */}
        {scheduleLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner message="Memuat jadwal shalat..." />
          </div>
        ) : error ? (
          <ErrorMessage 
            message="Gagal memuat jadwal shalat" 
            onRetry={() => refetch()} 
          />
        ) : schedule ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Location Info Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{schedule.lokasi}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{schedule.daerah}</span>
            </div>

            {/* Prayer Times */}
            <PrayerTimeCard jadwal={schedule.jadwal} />
          </div>
        ) : null}

        {/* Info Footer */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-muted/30 to-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Tentang Data Jadwal Shalat</p>
              <p className="text-xs text-muted-foreground">
                Data jadwal shalat bersumber dari Bimas Islam Kementerian Agama RI melalui API eQuran.id. 
                Waktu shalat dapat berbeda beberapa menit tergantung lokasi geografis dan metode perhitungan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
        <div className="container py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 Al-Quran Digital Indonesia
            </p>
            <p className="text-xs text-muted-foreground">
              Sumber data:{" "}
              <a 
                href="https://equran.id" 
                className="text-primary hover:underline font-medium" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                eQuran.id
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShalatPage;
