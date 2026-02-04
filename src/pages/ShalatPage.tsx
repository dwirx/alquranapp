import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchShalatCities, fetchShalatScheduleDaily } from "@/services/shalatApi";
import { Header } from "@/components/Header";
import { PrayerTimeCard } from "@/components/PrayerTimeCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { MapPin, Calendar, Clock, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        // Default to Jakarta if parse fails
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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container flex-1 py-4 sm:py-6 md:py-8">
        {/* Page Title */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            Jadwal Shalat
          </h1>
          <p className="text-sm text-muted-foreground">
            Waktu shalat untuk wilayah Indonesia
          </p>
        </div>

        {/* Current Time Display */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Waktu Sekarang</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                {format(currentTime, "HH:mm:ss")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tanggal</p>
              <p className="text-sm sm:text-base font-medium text-foreground">
                {format(currentTime, "EEEE, d MMMM yyyy", { locale: localeId })}
              </p>
            </div>
          </div>
        </div>

        {/* City Selector */}
        <div className="mb-4 sm:mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Pilih Kota/Kabupaten
          </label>
          <Popover open={openCitySelector} onOpenChange={setOpenCitySelector}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCitySelector}
                className="w-full justify-between h-11 sm:h-12 text-left font-normal"
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">
                    {selectedCity ? selectedCity.lokasi : "Pilih kota..."}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Cari kota..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {citiesLoading ? "Memuat..." : "Kota tidak ditemukan"}
                  </CommandEmpty>
                  {!searchQuery && (
                    <CommandGroup heading="Kota Populer">
                      {POPULAR_CITIES.map((city) => (
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
                  )}
                  <CommandGroup heading={searchQuery ? "Hasil Pencarian" : "Semua Kota"}>
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

        {/* Prayer Schedule */}
        {scheduleLoading ? (
          <LoadingSpinner message="Memuat jadwal shalat..." />
        ) : error ? (
          <ErrorMessage 
            message="Gagal memuat jadwal shalat" 
            onRetry={() => refetch()} 
          />
        ) : schedule ? (
          <div className="space-y-4">
            {/* Location Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{schedule.lokasi}, {schedule.daerah}</span>
            </div>

            {/* Prayer Times */}
            <PrayerTimeCard jadwal={schedule.jadwal} />
          </div>
        ) : null}

        {/* Info Footer */}
        <div className="mt-6 sm:mt-8 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            Data jadwal shalat bersumber dari{" "}
            <span className="font-medium">Bimas Islam Kementerian Agama RI</span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container py-4 sm:py-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sumber data:{" "}
            <a 
              href="https://equran.id" 
              className="text-primary hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              eQuran.id
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ShalatPage;
