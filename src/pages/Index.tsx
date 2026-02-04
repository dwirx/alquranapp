import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllSurahs } from "@/services/quranApi";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SurahCard } from "@/components/SurahCard";
import { SurahCardSkeleton } from "@/components/Skeletons";
import { ErrorMessage } from "@/components/ErrorMessage";
import { BottomNav } from "@/components/BottomNav";
import { LastReadCard, LastReadEmpty } from "@/components/LastReadCard";
import { FilterTabs, FilterType } from "@/components/FilterTabs";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { Search } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Header />
      
      <main className="container flex-1 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* Last Read Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Terakhir Dibaca
            </h2>
            <button className="text-xs text-primary hover:underline">
              Lihat semua
            </button>
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <LastReadCard key={`${item.surahNumber}-${index}`} item={item} />
                ))
              ) : (
                <LastReadEmpty />
              )}
            </div>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>
        </section>

        {/* Filter Tabs */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <FilterTabs 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
          
          {/* Search - visible on larger screens, or when tapped on mobile */}
          <div className="w-full sm:w-auto sm:min-w-[280px]">
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

        {/* Surah List */}
        {isLoading ? (
          <div className="grid gap-2 sm:gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <SurahCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorMessage 
            message="Gagal memuat daftar surah" 
            onRetry={() => refetch()} 
          />
        ) : (
          <div className="grid gap-2 sm:gap-3">
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
      </main>

      {/* Footer - hidden on mobile since we have bottom nav */}
      <footer className="hidden md:block border-t border-border bg-card mt-auto">
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

      {/* Bottom Navigation - mobile only */}
      <BottomNav />
    </div>
  );
};

export default Index;
