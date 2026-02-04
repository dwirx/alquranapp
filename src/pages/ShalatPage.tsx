import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProvinsi, fetchKabKota, fetchShalatScheduleMonthly } from "@/services/shalatApi";
import { ResponsiveLayout } from "@/components/layout";
import { TodayPrayerCard } from "@/components/TodayPrayerCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { MapPin, Clock, ChevronDown, Navigation, Loader2, CheckCircle2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { POPULAR_CITIES, calculateDistance } from "@/data/popularCities";

interface SelectedLocation {
  provinsi: string;
  kabkota: string;
}

const ShalatPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [openProvinsiSelector, setOpenProvinsiSelector] = useState(false);
  const [openKabKotaSelector, setOpenKabKotaSelector] = useState(false);
  const [provinsiSearch, setProvinsiSearch] = useState("");
  const [kabkotaSearch, setKabkotaSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentTime.getMonth() + 1);
  const [selectedYear] = useState(currentTime.getFullYear());
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedShalatLocation");
    if (savedLocation) {
      try {
        setSelectedLocation(JSON.parse(savedLocation));
      } catch {
        setSelectedLocation(POPULAR_CITIES[0]);
      }
    } else {
      setSelectedLocation(POPULAR_CITIES[0]);
    }
  }, []);

  // Save location to localStorage
  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem("selectedShalatLocation", JSON.stringify(selectedLocation));
    }
  }, [selectedLocation]);

  // Fetch all provinces
  const { data: provinsiList, isLoading: provinsiLoading } = useQuery({
    queryKey: ["shalat-provinsi"],
    queryFn: fetchProvinsi,
  });

  // Fetch kabupaten/kota for selected province
  const { data: kabkotaList, isLoading: kabkotaLoading } = useQuery({
    queryKey: ["shalat-kabkota", selectedLocation?.provinsi],
    queryFn: () => fetchKabKota(selectedLocation!.provinsi),
    enabled: !!selectedLocation?.provinsi && openKabKotaSelector,
  });

  // Fetch prayer schedule
  const { data: schedule, isLoading: scheduleLoading, error, refetch } = useQuery({
    queryKey: ["shalat-schedule", selectedLocation?.provinsi, selectedLocation?.kabkota, selectedMonth, selectedYear],
    queryFn: () => fetchShalatScheduleMonthly(
      selectedLocation!.provinsi,
      selectedLocation!.kabkota,
      selectedMonth,
      selectedYear
    ),
    enabled: !!selectedLocation?.provinsi && !!selectedLocation?.kabkota,
  });

  // Filter provinces based on search
  const filteredProvinsi = useMemo(() => {
    if (!provinsiList) return [];
    if (!provinsiSearch.trim()) return provinsiList;

    const query = provinsiSearch.toLowerCase();
    return provinsiList.filter(provinsi =>
      provinsi.toLowerCase().includes(query)
    );
  }, [provinsiList, provinsiSearch]);

  // Filter kabkota based on search
  const filteredKabKota = useMemo(() => {
    if (!kabkotaList) return [];
    if (!kabkotaSearch.trim()) return kabkotaList;

    const query = kabkotaSearch.toLowerCase();
    return kabkotaList.filter(kabkota =>
      kabkota.toLowerCase().includes(query)
    );
  }, [kabkotaList, kabkotaSearch]);

  const handleSelectProvinsi = (provinsi: string) => {
    setSelectedLocation({ provinsi, kabkota: "" });
    setOpenProvinsiSelector(false);
    setProvinsiSearch("");
    setLocationDetected(false);

    // Auto-open kabkota selector
    setTimeout(() => setOpenKabKotaSelector(true), 300);
  };

  const handleSelectKabKota = (kabkota: string) => {
    if (selectedLocation) {
      setSelectedLocation({ ...selectedLocation, kabkota });
      setOpenKabKotaSelector(false);
      setKabkotaSearch("");
    }
  };

  const handleSelectPopularCity = (city: typeof POPULAR_CITIES[number]) => {
    setSelectedLocation({ provinsi: city.provinsi, kabkota: city.kabkota });
    setLocationDetected(false);
    toast.success(`Lokasi dipilih: ${city.kabkota}`, {
      description: city.provinsi,
    });
  };

  // Detect user location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung", {
        description: "Browser Anda tidak mendukung deteksi lokasi",
      });
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Find nearest city from popular cities
        let nearestCity = POPULAR_CITIES[0] as typeof POPULAR_CITIES[number];
        let minDistance = Infinity;

        POPULAR_CITIES.forEach((city) => {
          const distance = calculateDistance(latitude, longitude, city.lat, city.lon);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCity = city;
          }
        });

        setSelectedLocation({ provinsi: nearestCity.provinsi, kabkota: nearestCity.kabkota });
        setLocationDetected(true);
        setIsDetectingLocation(false);

        toast.success(`Lokasi terdeteksi: ${nearestCity.kabkota}`, {
          description: `Jarak sekitar ${Math.round(minDistance)} km dari lokasi Anda`,
        });
      },
      (error) => {
        setIsDetectingLocation(false);
        let errorMessage = "Gagal mendeteksi lokasi";

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Informasi lokasi tidak tersedia.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Waktu deteksi lokasi habis.";
        }

        toast.error("Deteksi Lokasi Gagal", {
          description: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Get today's schedule
  const todaySchedule = useMemo(() => {
    if (!schedule?.jadwal) return null;
    const today = currentTime.getDate();
    return schedule.jadwal.find(j => j.tanggal === today);
  }, [schedule, currentTime]);

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2026, i, 1), "MMMM", { locale: localeId }),
  }));

  return (
    <ResponsiveLayout>
      <div className="container py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4 sm:p-6 md:p-8 border border-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Jadwal Shalat
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                  Waktu shalat akurat untuk seluruh wilayah Indonesia
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

        {/* Location Controls */}
        <div className="space-y-3 sm:space-y-4">
          {/* Auto Detect + Popular Cities */}
          <div className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Pilih Lokasi Cepat
              </label>
              <Button
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mendeteksi...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    Deteksi Lokasi Saya
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CITIES.map((city, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleSelectPopularCity(city)}
                  variant={selectedLocation?.kabkota === city.kabkota ? "default" : "outline"}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  {city.kabkota.replace("Kota ", "").replace("Kab. ", "")}
                </Button>
              ))}
            </div>
          </div>

          {/* Province & City Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm">
            {/* Province Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Provinsi
              </label>
              <Popover open={openProvinsiSelector} onOpenChange={setOpenProvinsiSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProvinsiSelector}
                    className="w-full justify-between h-11 text-left font-normal hover:bg-muted/50"
                  >
                    <span className="truncate">
                      {selectedLocation?.provinsi || "Pilih provinsi..."}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Cari provinsi..."
                      value={provinsiSearch}
                      onValueChange={setProvinsiSearch}
                    />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>
                        {provinsiLoading ? "Memuat..." : "Provinsi tidak ditemukan"}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredProvinsi.map((provinsi) => (
                          <CommandItem
                            key={provinsi}
                            value={provinsi}
                            onSelect={() => handleSelectProvinsi(provinsi)}
                            className="cursor-pointer"
                          >
                            {provinsi}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Kabupaten/Kota Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Kabupaten/Kota
                {locationDetected && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </label>
              <Popover open={openKabKotaSelector} onOpenChange={setOpenKabKotaSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openKabKotaSelector}
                    className="w-full justify-between h-11 text-left font-normal hover:bg-muted/50"
                    disabled={!selectedLocation?.provinsi}
                  >
                    <span className="truncate">
                      {selectedLocation?.kabkota || "Pilih kab/kota..."}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Cari kab/kota..."
                      value={kabkotaSearch}
                      onValueChange={setKabkotaSearch}
                    />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>
                        {kabkotaLoading ? "Memuat..." : "Kab/Kota tidak ditemukan"}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredKabKota.map((kabkota) => (
                          <CommandItem
                            key={kabkota}
                            value={kabkota}
                            onSelect={() => handleSelectKabKota(kabkota)}
                            className="cursor-pointer"
                          >
                            {kabkota}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Month Selector */}
          <div className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm">
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              Bulan
            </label>
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-full sm:w-64 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label} {selectedYear}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        ) : schedule && todaySchedule ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Location Info Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{schedule.kabkota}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{schedule.provinsi}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{schedule.bulan_nama} {schedule.tahun}</span>
            </div>

            {/* Today's Prayer Times - Highlighted */}
            <TodayPrayerCard jadwal={todaySchedule} currentTime={currentTime} />

            {/* Full Month Schedule */}
            <div className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Jadwal Lengkap {schedule.bulan_nama}
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {schedule.jadwal.map((jadwal) => {
                  const isToday = jadwal.tanggal === currentTime.getDate();

                  return (
                    <div
                      key={jadwal.tanggal}
                      className={`p-3 sm:p-4 rounded-lg border transition-all ${
                        isToday
                          ? "bg-primary/10 border-primary/50 shadow-md ring-2 ring-primary/20"
                          : "bg-muted/30 border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-primary text-primary-foreground">
                              HARI INI
                            </span>
                          )}
                          <span className={`font-semibold ${isToday ? "text-primary" : ""}`}>
                            {jadwal.hari}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {jadwal.tanggal_lengkap}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Subuh</div>
                          <div className="font-medium">{jadwal.subuh}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Dzuhur</div>
                          <div className="font-medium">{jadwal.dzuhur}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Ashar</div>
                          <div className="font-medium">{jadwal.ashar}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Maghrib</div>
                          <div className="font-medium">{jadwal.maghrib}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Isya</div>
                          <div className="font-medium">{jadwal.isya}</div>
                        </div>
                        <div className="hidden sm:block">
                          <div className="text-muted-foreground">Imsak</div>
                          <div className="font-medium">{jadwal.imsak}</div>
                        </div>
                        <div className="hidden sm:block">
                          <div className="text-muted-foreground">Terbit</div>
                          <div className="font-medium">{jadwal.terbit}</div>
                        </div>
                        <div className="hidden sm:block">
                          <div className="text-muted-foreground">Dhuha</div>
                          <div className="font-medium">{jadwal.dhuha}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Pilih provinsi dan kabupaten/kota untuk melihat jadwal shalat
          </div>
        )}

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
      </div>
    </ResponsiveLayout>
  );
};

export default ShalatPage;
