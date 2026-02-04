import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllSurahs } from "@/services/quranApi";
import { ResponsiveLayout } from "@/components/layout";
import { SearchBar } from "@/components/SearchBar";
import { SurahCard } from "@/components/SurahCard";
import { SurahCardSkeleton } from "@/components/Skeletons";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LastReadCard, LastReadEmpty } from "@/components/LastReadCard";
import { FilterTabs, FilterType } from "@/components/FilterTabs";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { Search, Clock, BookOpen, Moon, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("sura");
  const { history } = useReadingHistory();

  const { data: surahs, isLoading, error, refetch } = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchAllSurahs,
  });

  const filteredSurahs = useMemo(() => {
    if (!surahs) return [];
    if (!searchQuery.trim()) return surahs;

    const query = searchQuery.toLowerCase();
    return surahs.filter(
      (surah) =>
        surah.namaLatin.toLowerCase().includes(query) ||
        surah.arti.toLowerCase().includes(query) ||
        surah.nomor.toString().includes(query)
    );
  }, [surahs, searchQuery]);

  return (
    <ResponsiveLayout>
      {/* Desktop Header for lg+ */}
      <div className="hidden lg:block border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <h1 className="text-2xl font-bold text-foreground">Assalamu'alaikum</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="container py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* Dashboard Widgets - Grid Layout for Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Last Read Widget */}
          <Card className="md:col-span-2 xl:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Terakhir Dibaca
                </CardTitle>
                <Link
                  to="/bookmark"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Lihat semua
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-3 pb-2">
                  {history.length > 0 ? (
                    history.slice(0, 5).map((item, index) => (
                      <LastReadCard key={`${item.surahNumber}-${index}`} item={item} />
                    ))
                  ) : (
                    <LastReadEmpty />
                  )}
                </div>
                <ScrollBar orientation="horizontal" className="h-1.5" />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Prayer Times Widget */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Waktu Shalat
                </CardTitle>
                <Link
                  to="/jadwal-shalat"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Detail
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Lihat jadwal shalat untuk kota Anda
              </p>
              <Link
                to="/jadwal-shalat"
                className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
              >
                Buka Jadwal Shalat
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </CardContent>
          </Card>

          {/* Quick Links Widget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                Akses Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Link
                to="/doa"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-sm">Doa Harian</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                to="/imsakiyah"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-sm">Jadwal Imsakiyah</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search Section */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          <div className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[320px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari surah..."
            />
          </div>
        </section>

        {/* Results Count */}
        {searchQuery && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            Ditemukan {filteredSurahs.length} surah
          </p>
        )}

        {/* Surah List - Grid on Desktop */}
        {isLoading ? (
          <div className="grid gap-2 sm:gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <SurahCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorMessage
            message="Gagal memuat daftar surah"
            onRetry={() => refetch()}
          />
        ) : (
          <div className="grid gap-2 sm:gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {filteredSurahs.map((surah, index) => (
              <SurahCard key={surah.nomor} surah={surah} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSurahs.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              Tidak ditemukan surah dengan kata kunci "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Footer - visible on lg+ */}
      <footer className="hidden lg:block border-t border-border bg-card mt-auto">
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
    </ResponsiveLayout>
  );
};

export default Index;
