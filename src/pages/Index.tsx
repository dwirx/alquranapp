import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllSurahs } from "@/services/quranApi";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SurahCard } from "@/components/SurahCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { BookMarked, Moon, Sun } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 md:py-8">
        {/* Stats Section */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-primary" />
            <span>114 Surah</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>6.236 Ayat</span>
          <span className="hidden sm:inline">•</span>
          <span>30 Juz</span>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama surah atau arti..."
          />
        </div>

        {/* Results Count */}
        {searchQuery && (
          <p className="mb-4 text-sm text-muted-foreground">
            Ditemukan {filteredSurahs.length} surah
          </p>
        )}

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner message="Memuat daftar surah..." />
        ) : error ? (
          <ErrorMessage 
            message="Gagal memuat daftar surah" 
            onRetry={() => refetch()} 
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSurahs.map((surah, index) => (
              <SurahCard key={surah.nomor} surah={surah} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSurahs.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Tidak ditemukan surah dengan kata kunci "{searchQuery}"
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sumber data: <a href="https://equran.id" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">eQuran.id</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
