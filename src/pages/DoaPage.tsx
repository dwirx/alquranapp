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
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Filter, X, ChevronDown, ChevronUp } from "lucide-react";

const DoaPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrup, setSelectedGrup] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedDoa, setSelectedDoa] = useState<Doa | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(true);

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

  const hasActiveFilters = selectedGrup !== "all" || selectedTag !== "all" || searchQuery.trim() !== "";
  const activeFilterCount = [selectedGrup !== "all", selectedTag !== "all", searchQuery.trim() !== ""].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Header />

      <main className="container flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8 lg:p-10 border-2 border-primary/20 shadow-xl shadow-primary/5">
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
                  🤲 Doa & Dzikir
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Kumpulan doa dan dzikir harian lengkap dengan teks Arab, transliterasi, dan terjemahan bahasa Indonesia
                </p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tabular-nums">
                  {data?.data.length || 228}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 font-medium">
                  Doa & Dzikir
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters - Sticky on Desktop */}
        <div className="lg:sticky lg:top-4 lg:z-20 space-y-4 sm:space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Cari doa berdasarkan judul, teks Arab, transliterasi, atau terjemahan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-12 sm:h-14 text-base shadow-md border-2 focus:border-primary/50 transition-all duration-300"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="rounded-xl lg:rounded-2xl bg-card/95 backdrop-blur-md border-2 border-border shadow-lg transition-all duration-300">
            {/* Filter Header */}
            <button
              onClick={() => setFilterExpanded(!filterExpanded)}
              className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-muted/30 transition-colors duration-200 rounded-t-xl lg:rounded-t-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">
                    Filter Doa
                  </h2>
                  {hasActiveFilters && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {activeFilterCount} filter aktif
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Badge variant="default" className="font-semibold">
                    {filteredDoa.length}
                  </Badge>
                )}
                {filterExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Filter Content */}
            {filterExpanded && (
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-5 border-t border-border/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
                  {/* Group Filter */}
                  <div className="space-y-2.5">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      Kategori
                      {selectedGrup !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                          {grupList.length}
                        </Badge>
                      )}
                    </label>
                    <Select value={selectedGrup} onValueChange={setSelectedGrup}>
                      <SelectTrigger className="h-11 border-2 hover:border-primary/50 transition-colors duration-200">
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
                  <div className="space-y-2.5">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      Tag
                      {selectedTag !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                          {tagList.length}
                        </Badge>
                      )}
                    </label>
                    <Select value={selectedTag} onValueChange={setSelectedTag}>
                      <SelectTrigger className="h-11 border-2 hover:border-primary/50 transition-colors duration-200">
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
                      className="w-full h-11 border-2 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-200"
                      disabled={!hasActiveFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset Filter
                    </Button>
                  </div>
                </div>

                {/* Active Filters Chips */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/50">
                    <span className="text-xs font-medium text-muted-foreground">
                      Filter aktif:
                    </span>
                    {selectedGrup !== "all" && (
                      <Badge
                        variant="default"
                        className="cursor-pointer hover:bg-primary/80 transition-colors duration-200"
                        onClick={() => setSelectedGrup("all")}
                      >
                        {selectedGrup}
                        <X className="h-3 w-3 ml-1.5" />
                      </Badge>
                    )}
                    {selectedTag !== "all" && (
                      <Badge
                        variant="default"
                        className="cursor-pointer hover:bg-primary/80 transition-colors duration-200"
                        onClick={() => setSelectedTag("all")}
                      >
                        {selectedTag}
                        <X className="h-3 w-3 ml-1.5" />
                      </Badge>
                    )}
                    {searchQuery && (
                      <Badge
                        variant="default"
                        className="cursor-pointer hover:bg-primary/80 transition-colors duration-200 max-w-xs truncate"
                        onClick={() => setSearchQuery("")}
                      >
                        "{searchQuery}"
                        <X className="h-3 w-3 ml-1.5 shrink-0" />
                      </Badge>
                    )}
                  </div>
                )}

                {/* Result Count */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-center font-medium text-foreground">
                      Menampilkan{" "}
                      <span className="text-primary font-bold">{filteredDoa.length}</span>{" "}
                      dari{" "}
                      <span className="font-semibold">{data?.data.length || 0}</span>{" "}
                      doa
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Doa List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner message="Memuat doa..." />
          </div>
        ) : error ? (
          <ErrorMessage
            message="Gagal memuat daftar doa"
            onRetry={() => refetch()}
          />
        ) : filteredDoa.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="max-w-md mx-auto">
              <div className="mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                </div>
                <BookOpen className="h-20 w-20 text-muted-foreground mx-auto relative" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                Tidak ada doa ditemukan
              </h3>
              <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                Coba ubah filter atau kata kunci pencarian Anda
              </p>
              <Button
                onClick={handleResetFilters}
                variant="default"
                size="lg"
                className="shadow-lg"
              >
                <X className="h-4 w-4 mr-2" />
                Reset Semua Filter
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredDoa.map((doa) => (
              <DoaCard key={doa.id} doa={doa} onClick={() => handleDoaClick(doa)} />
            ))}
          </div>
        )}

        {/* Info Footer */}
        {!isLoading && !error && (
          <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-muted/40 via-muted/20 to-background border-2 border-border shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                  Tentang Doa & Dzikir
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Kumpulan {data?.data.length || 228} doa dan dzikir harian dari berbagai sumber hadits shahih.
                  Bacalah dengan khusyuk dan penuh penghayatan.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <DoaDetailModal
        doa={selectedDoa}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Footer - hidden on mobile */}
      <footer className="hidden md:block border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
        <div className="container py-6 px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © 2026 Al-Quran Digital Indonesia
            </p>
            <p className="text-sm text-muted-foreground">
              Sumber data:{" "}
              <a
                href="https://equran.id"
                className="text-primary hover:underline font-semibold transition-colors duration-200"
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
