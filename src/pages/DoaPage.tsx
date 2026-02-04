import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDoaList } from "@/services/doaApi";
import { Doa } from "@/types/doa";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { DoaCard } from "@/components/DoaCard";
import { DoaDetailModal } from "@/components/DoaDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen, Filter } from "lucide-react";

const DoaPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrup, setSelectedGrup] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedDoa, setSelectedDoa] = useState<Doa | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch doa list
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["doa-list"],
    queryFn: () => fetchDoaList(),
  });

  // Extract unique groups and tags
  const { grupList, tagList } = useMemo(() => {
    if (!data?.data) return { grupList: [], tagList: [] };

    const groups = new Set<string>();
    const tags = new Set<string>();

    data.data.forEach((doa) => {
      if (doa.grup) groups.add(doa.grup);
      if (doa.tag) doa.tag.forEach((t) => tags.add(t));
    });

    return {
      grupList: Array.from(groups).sort(),
      tagList: Array.from(tags).sort(),
    };
  }, [data]);

  // Filter doa based on search, group, and tag
  const filteredDoa = useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    // Filter by group
    if (selectedGrup !== "all") {
      filtered = filtered.filter((doa) => doa.grup === selectedGrup);
    }

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((doa) => doa.tag?.includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doa) =>
          doa.nama.toLowerCase().includes(query) ||
          doa.ar.toLowerCase().includes(query) ||
          doa.tr.toLowerCase().includes(query) ||
          doa.idn.toLowerCase().includes(query) ||
          doa.tag?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [data, searchQuery, selectedGrup, selectedTag]);

  const handleDoaClick = (doa: Doa) => {
    setSelectedDoa(doa);
    setDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGrup("all");
    setSelectedTag("all");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
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
                  🤲 Doa & Dzikir
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                  Kumpulan doa dan dzikir harian lengkap dengan teks Arab, transliterasi, dan terjemahan bahasa Indonesia
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                  {data?.data.length || 228}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Doa & Dzikir
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari doa berdasarkan judul, teks Arab, transliterasi, atau terjemahan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 sm:h-12"
            />
          </div>

          {/* Filters */}
          <div className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium text-foreground">
                Filter Doa
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Group Filter */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Kategori</label>
                <Select value={selectedGrup} onValueChange={setSelectedGrup}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {grupList.map((grup) => (
                      <SelectItem key={grup} value={grup}>
                        {grup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tag Filter */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Tag</label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Semua Tag" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">Semua Tag</SelectItem>
                    {tagList.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="w-full h-10"
                  disabled={
                    selectedGrup === "all" &&
                    selectedTag === "all" &&
                    !searchQuery
                  }
                >
                  Reset Filter
                </Button>
              </div>
            </div>

            {/* Active Filters Info */}
            {(selectedGrup !== "all" || selectedTag !== "all" || searchQuery) && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Menampilkan {filteredDoa.length} dari {data?.data.length || 0}{" "}
                  doa
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Doa List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner message="Memuat doa..." />
          </div>
        ) : error ? (
          <ErrorMessage
            message="Gagal memuat daftar doa"
            onRetry={() => refetch()}
          />
        ) : filteredDoa.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Tidak ada doa ditemukan
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Coba ubah filter atau kata kunci pencarian
            </p>
            <Button onClick={handleResetFilters} variant="outline">
              Reset Filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDoa.map((doa) => (
              <DoaCard key={doa.id} doa={doa} onClick={() => handleDoaClick(doa)} />
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-muted/30 to-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Tentang Doa & Dzikir
              </p>
              <p className="text-xs text-muted-foreground">
                Kumpulan {data?.data.length || 228} doa dan dzikir harian dari berbagai sumber hadits shahih.
                Bacalah dengan khusyuk dan penuh penghayatan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <DoaDetailModal
        doa={selectedDoa}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Footer - hidden on mobile */}
      <footer className="hidden md:block border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
        <div className="container py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2026 Al-Quran Digital Indonesia
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

      {/* Bottom Navigation - mobile only */}
      <BottomNav />
    </div>
  );
};

export default DoaPage;
