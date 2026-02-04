import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllSurahs } from "@/services/quranApi";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SurahCard } from "@/components/SurahCard";
import { SurahCardSkeleton } from "@/components/Skeletons";
import { ErrorMessage } from "@/components/ErrorMessage";
import { BookMarked, ScrollText, Layers } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container flex-1 py-4 sm:py-6 md:py-8">
        {/* Stats Section */}
        <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-xl bg-card border border-border">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookMarked className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl font-bold text-foreground">114</p>
              <p className="text-xs text-muted-foreground">Surah</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-xl bg-card border border-border">
            <div className="p-2 rounded-lg bg-accent/10">
              <ScrollText className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl font-bold text-foreground">6.236</p>
              <p className="text-xs text-muted-foreground">Ayat</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-xl bg-card border border-border">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl font-bold text-foreground">30</p>
              <p className="text-xs text-muted-foreground">Juz</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama surah atau arti..."
          />
        </div>

        {/* Results Count */}
        {searchQuery && (
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
            Ditemukan {filteredSurahs.length} surah
          </p>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSurahs.map((surah, index) => (
              <SurahCard key={surah.nomor} surah={surah} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSurahs.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <BookMarked className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              Tidak ditemukan surah dengan kata kunci "{searchQuery}"
            </p>
          </div>
        )}
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

export default Index;
