import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProvinsiImsakiyah,
  fetchKabKotaImsakiyah,
  fetchImsakiyah,
} from "@/services/imsakiyahApi";
import { ResponsiveLayout } from "@/components/layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TodayImsakiyahCard } from "@/components/TodayImsakiyahCard";
import { ImsakiyahTable } from "@/components/ImsakiyahTable";
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
import { MapPin, ChevronDown, Moon, Calendar } from "lucide-react";
import { toast } from "sonner";

interface SelectedLocation {
  provinsi: string;
  kabkota: string;
}

const ImsakiyahPage = () => {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [openProvinsiSelector, setOpenProvinsiSelector] = useState(false);
  const [openKabKotaSelector, setOpenKabKotaSelector] = useState(false);
  const [provinsiSearch, setProvinsiSearch] = useState("");
  const [kabkotaSearch, setKabkotaSearch] = useState("");

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedImsakiyahLocation");
    if (savedLocation) {
      try {
        setSelectedLocation(JSON.parse(savedLocation));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Save location to localStorage
  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem(
        "selectedImsakiyahLocation",
        JSON.stringify(selectedLocation)
      );
      // Also sync to ShalatPage location
      localStorage.setItem(
        "selectedShalatLocation",
        JSON.stringify(selectedLocation)
      );
    }
  }, [selectedLocation]);

  // Fetch provinces
  const { data: provinsiData, isLoading: provinsiLoading } = useQuery({
    queryKey: ["imsakiyah-provinsi"],
    queryFn: fetchProvinsiImsakiyah,
    staleTime: Infinity, // Never refetch (data doesn't change)
  });

  // Fetch kabupaten/kota
  const { data: kabkotaData, isLoading: kabkotaLoading } = useQuery({
    queryKey: ["imsakiyah-kabkota", selectedLocation?.provinsi],
    queryFn: () => fetchKabKotaImsakiyah(selectedLocation!.provinsi),
    enabled: !!selectedLocation?.provinsi && openKabKotaSelector,
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });

  // Fetch imsakiyah schedule
  const {
    data: imsakiyahData,
    isLoading: scheduleLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "imsakiyah-schedule",
      selectedLocation?.provinsi,
      selectedLocation?.kabkota,
    ],
    queryFn: () =>
      fetchImsakiyah(selectedLocation!.provinsi, selectedLocation!.kabkota),
    enabled: !!selectedLocation?.provinsi && !!selectedLocation?.kabkota,
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });

  // Filter provinces based on search
  const filteredProvinsi = useMemo(() => {
    if (!provinsiData?.data) return [];
    if (!provinsiSearch) return provinsiData.data;
    return provinsiData.data.filter((provinsi) =>
      provinsi.toLowerCase().includes(provinsiSearch.toLowerCase())
    );
  }, [provinsiData, provinsiSearch]);

  // Filter kabkota based on search
  const filteredKabKota = useMemo(() => {
    if (!kabkotaData?.data) return [];
    if (!kabkotaSearch) return kabkotaData.data;
    return kabkotaData.data.filter((kabkota) =>
      kabkota.toLowerCase().includes(kabkotaSearch.toLowerCase())
    );
  }, [kabkotaData, kabkotaSearch]);

  // Calculate current Ramadhan day (simplified - assumes we're in Ramadhan)
  // In production, you'd calculate based on actual Hijri calendar
  const currentDay = useMemo(() => {
    const now = new Date();
    const ramadhanStart = new Date("2026-02-28"); // Example: Ramadhan 1447H starts
    const daysDiff = Math.floor(
      (now.getTime() - ramadhanStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const ramadhanDay = daysDiff + 1;
    return ramadhanDay > 0 && ramadhanDay <= 30 ? ramadhanDay : 1;
  }, []);

  const todaySchedule = useMemo(() => {
    if (!imsakiyahData?.data.imsakiyah) return null;
    return (
      imsakiyahData.data.imsakiyah.find((day) => day.tanggal === currentDay) ||
      null
    );
  }, [imsakiyahData, currentDay]);

  const handleProvinsiSelect = (provinsi: string) => {
    setSelectedLocation({ provinsi, kabkota: "" });
    setOpenProvinsiSelector(false);
    setProvinsiSearch("");
    setOpenKabKotaSelector(true);
  };

  const handleKabKotaSelect = (kabkota: string) => {
    if (!selectedLocation?.provinsi) return;
    setSelectedLocation({ ...selectedLocation, kabkota });
    setOpenKabKotaSelector(false);
    setKabkotaSearch("");
    toast.success(`Lokasi diubah ke ${kabkota}`);
  };

  return (
    <ResponsiveLayout>
      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8 lg:p-10 border-2 border-primary/20 shadow-xl shadow-primary/5">
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Moon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                      Jadwal Imsakiyah
                    </h1>
                    <p className="text-base sm:text-lg text-primary font-semibold mt-1">
                      Ramadhan 1447 H / 2026 M
                    </p>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Jadwal lengkap waktu Imsak dan Shalat selama 30 hari penuh berkah
                </p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="p-3 rounded-xl bg-primary/10 mb-2">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tabular-nums">
                  30
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 font-medium">
                  Hari Ramadhan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Selector */}
        <div className="rounded-xl lg:rounded-2xl bg-card/95 backdrop-blur-md border-2 border-border shadow-lg p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Pilih Lokasi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Provinsi Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Provinsi</label>
              <Popover open={openProvinsiSelector} onOpenChange={setOpenProvinsiSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-11 border-2"
                  >
                    <span className="truncate">
                      {selectedLocation?.provinsi || "Pilih Provinsi"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Cari provinsi..."
                      value={provinsiSearch}
                      onValueChange={setProvinsiSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Provinsi tidak ditemukan</CommandEmpty>
                      <CommandGroup>
                        {provinsiLoading ? (
                          <div className="p-4 text-center">
                            <LoadingSpinner message="Memuat provinsi..." />
                          </div>
                        ) : (
                          filteredProvinsi.map((provinsi) => (
                            <CommandItem
                              key={provinsi}
                              value={provinsi}
                              onSelect={handleProvinsiSelect}
                            >
                              {provinsi}
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Kabupaten/Kota Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Kabupaten/Kota
              </label>
              <Popover open={openKabKotaSelector} onOpenChange={setOpenKabKotaSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={!selectedLocation?.provinsi}
                    className="w-full justify-between h-11 border-2"
                  >
                    <span className="truncate">
                      {selectedLocation?.kabkota || "Pilih Kab/Kota"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Cari kabupaten/kota..."
                      value={kabkotaSearch}
                      onValueChange={setKabkotaSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Kabupaten/Kota tidak ditemukan</CommandEmpty>
                      <CommandGroup>
                        {kabkotaLoading ? (
                          <div className="p-4 text-center">
                            <LoadingSpinner message="Memuat kab/kota..." />
                          </div>
                        ) : (
                          filteredKabKota.map((kabkota) => (
                            <CommandItem
                              key={kabkota}
                              value={kabkota}
                              onSelect={handleKabKotaSelect}
                            >
                              {kabkota}
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Content */}
        {!selectedLocation?.kabkota ? (
          <div className="text-center py-20 px-4">
            <div className="max-w-md mx-auto">
              <div className="mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                </div>
                <MapPin className="h-20 w-20 text-muted-foreground mx-auto relative" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                Pilih Lokasi Anda
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Pilih provinsi dan kabupaten/kota untuk melihat jadwal imsakiyah Ramadhan
              </p>
            </div>
          </div>
        ) : scheduleLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner message="Memuat jadwal imsakiyah..." />
          </div>
        ) : error ? (
          <ErrorMessage
            message="Gagal memuat jadwal imsakiyah"
            onRetry={() => refetch()}
          />
        ) : imsakiyahData?.data ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Today's Card */}
            <TodayImsakiyahCard
              todaySchedule={todaySchedule}
              currentDay={currentDay}
              provinsi={imsakiyahData.data.provinsi}
              kabkota={imsakiyahData.data.kabkota}
            />

            {/* Full Schedule Table */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                Jadwal Lengkap 30 Hari Ramadhan
              </h3>
              <ImsakiyahTable
                schedule={imsakiyahData.data.imsakiyah}
                currentDay={currentDay}
              />
            </div>

            {/* Info Footer */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-muted/40 via-muted/20 to-background border-2 border-border shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                  <Moon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                    Tentang Jadwal Imsakiyah
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Jadwal imsakiyah ini bersumber dari Kementerian Agama RI untuk Ramadhan
                    1447H / 2026M. Waktu dapat berbeda beberapa menit tergantung lokasi
                    spesifik Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ResponsiveLayout>
  );
};

export default ImsakiyahPage;
