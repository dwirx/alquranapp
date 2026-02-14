import { useState, useCallback, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSurahDetail, fetchTafsir } from "@/services/quranApi";
import { ResponsiveLayout } from "@/components/layout";
import { AyatCard } from "@/components/AyatCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { AyatCardSkeleton } from "@/components/Skeletons";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Ayat } from "@/types/quran";
import { BookOpen, MapPin, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useSettings } from "@/hooks/useSettings";

const SurahPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const surahNumber = parseInt(id || "1", 10);

  const [currentAyat, setCurrentAyat] = useState<Ayat | null>(null);
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const [tafsirAyat, setTafsirAyat] = useState<number | null>(null);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { addToHistory } = useReadingHistory();
  const { settings } = useSettings();

  const { data: surah, isLoading, error, refetch } = useQuery({
    queryKey: ["surah", surahNumber],
    queryFn: () => fetchSurahDetail(surahNumber),
  });

  const { data: tafsir } = useQuery({
    queryKey: ["tafsir", surahNumber],
    queryFn: () => fetchTafsir(surahNumber),
    enabled: tafsirAyat !== null,
  });

  const handlePlayAudio = useCallback((ayat: Ayat) => {
    if (currentAyat?.nomorAyat === ayat.nomorAyat) {
      setCurrentAyat(null);
      setAutoPlayActive(false);
    } else {
      setCurrentAyat(ayat);
      setAutoPlayActive(true);
    }
  }, [currentAyat]);

  const handleNextAyat = useCallback(() => {
    if (!surah || !currentAyat) return;
    const nextIndex = surah.ayat.findIndex(a => a.nomorAyat === currentAyat.nomorAyat) + 1;
    if (nextIndex < surah.ayat.length) {
      setAutoPlayActive(true);
      setCurrentAyat(surah.ayat[nextIndex]);
    }
  }, [surah, currentAyat]);

  const handlePreviousAyat = useCallback(() => {
    if (!surah || !currentAyat) return;
    const prevIndex = surah.ayat.findIndex(a => a.nomorAyat === currentAyat.nomorAyat) - 1;
    if (prevIndex >= 0) {
      setAutoPlayActive(true);
      setCurrentAyat(surah.ayat[prevIndex]);
    }
  }, [surah, currentAyat]);

  // Add to reading history when surah is loaded
  useEffect(() => {
    if (surah) {
      addToHistory({
        surahNumber: surah.nomor,
        surahName: surah.namaLatin,
        surahNameArabic: surah.nama,
      });
    }
  }, [surah?.nomor, addToHistory]);

  // Scroll to ayat if hash is present in URL
  useEffect(() => {
    if (surah && location.hash) {
      const ayatId = location.hash.slice(1); // Remove the '#'
      const element = document.getElementById(ayatId);
      if (element) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Add highlight effect
          element.classList.add("ring-2", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
          }, 2000);
        }, 300);
      }
    }
  }, [surah, location.hash]);

  // Keep active ayat visible when audio moves to next/previous ayat
  useEffect(() => {
    if (!currentAyat) return;
    const element = document.getElementById(`ayat-${currentAyat.nomorAyat}`);
    if (!element) return;

    setTimeout(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }, [currentAyat?.nomorAyat]);

  const currentTafsirText = tafsir?.tafsir.find(t => t.ayat === tafsirAyat)?.teks;

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="container py-4 sm:py-6">
          <div className="mb-6">
            <div className="h-4 w-32 bg-muted rounded shimmer mb-4" />
            <div className="islamic-border bg-card p-4 sm:p-6 md:p-8">
              <div className="text-center space-y-3">
                <div className="h-10 w-32 mx-auto bg-muted rounded shimmer" />
                <div className="h-6 w-24 mx-auto bg-muted rounded shimmer" />
                <div className="h-4 w-40 mx-auto bg-muted rounded shimmer" />
              </div>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <AyatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !surah) {
    return (
      <ResponsiveLayout>
        <div className="container py-8">
          <ErrorMessage
            message="Gagal memuat surah"
            onRetry={() => refetch()}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  const currentAyatIndex = currentAyat
    ? surah.ayat.findIndex(a => a.nomorAyat === currentAyat.nomorAyat)
    : -1;

  return (
    <ResponsiveLayout>
      <div className={currentAyat ? "pb-56 sm:pb-60 lg:pb-40" : "pb-8"}>
        <div className="container py-4 sm:py-6">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors touch-target"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Link>

          {/* Surah Header */}
          <div className="islamic-border bg-card p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <div className="text-center">
              <h1 className="surah-name-arabic text-2xl sm:text-3xl md:text-4xl mb-2">
                {surah.nama}
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                {surah.namaLatin}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">{surah.arti}</p>

              <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {surah.jumlahAyat} Ayat
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {surah.tempatTurun}
                </span>
              </div>
            </div>

            {/* Surah Description */}
            {surah.deskripsi && (
              <div
                className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border text-xs sm:text-sm text-muted-foreground leading-relaxed [&>i]:font-medium [&>i]:text-foreground"
                dangerouslySetInnerHTML={{ __html: surah.deskripsi }}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            {surah.suratSebelumnya ? (
              <Link to={`/surah/${surah.suratSebelumnya.nomor}`}>
                <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm touch-target">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-24 truncate">{surah.suratSebelumnya.namaLatin}</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {surah.suratSelanjutnya && (
              <Link to={`/surah/${surah.suratSelanjutnya.nomor}`}>
                <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm touch-target">
                  <span className="hidden sm:inline max-w-24 truncate">{surah.suratSelanjutnya.namaLatin}</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Bismillah (if not Al-Fatihah or At-Taubah) */}
          {surahNumber !== 1 && surahNumber !== 9 && (
            <div className="text-center py-6 sm:py-8 mb-4 sm:mb-6 rounded-xl bg-card border border-border">
              <p className="arabic-text-lg text-quran-gold">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
              </p>
            </div>
          )}

          {/* Ayat List */}
          <div className="space-y-3 sm:space-y-4">
            {surah.ayat.map((ayat) => (
              <AyatCard
                key={ayat.nomorAyat}
                ayat={ayat}
                surahNumber={surah.nomor}
                surahName={surah.namaLatin}
                surahNameArabic={surah.nama}
                onPlayAudio={handlePlayAudio}
                isPlaying={currentAyat?.nomorAyat === ayat.nomorAyat}
                onShowTafsir={setTafsirAyat}
                isBookmarked={isBookmarked(surah.nomor, ayat.nomorAyat)}
                onToggleBookmark={() => toggleBookmark({
                  surahNumber: surah.nomor,
                  surahName: surah.namaLatin,
                  surahNameArabic: surah.nama,
                  ayatNumber: ayat.nomorAyat,
                  ayatText: ayat.teksIndonesia.substring(0, 100),
                })}
                showLatin={settings.showLatin}
                showTranslation={settings.showTranslation}
                fontSize={settings.fontSize}
              />
            ))}
          </div>
        </div>

        {/* Floating Audio Player */}
        {currentAyat && (
          <div className="fixed left-0 right-0 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] lg:bottom-0 lg:left-60 p-3 sm:p-4 glass-effect border-t border-border z-[60]">
            <div className="container max-w-4xl mx-auto">
              <AudioPlayer
                ayat={currentAyat}
                surahName={surah.namaLatin}
                autoPlay={autoPlayActive}
                onNext={handleNextAyat}
                onPrevious={handlePreviousAyat}
                hasNext={currentAyatIndex < surah.ayat.length - 1}
                hasPrevious={currentAyatIndex > 0}
                onClose={() => {
                  setCurrentAyat(null);
                  setAutoPlayActive(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Tafsir Modal */}
        <Dialog open={tafsirAyat !== null} onOpenChange={() => setTafsirAyat(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh] mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                Tafsir {surah.namaLatin} Ayat {tafsirAyat}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] sm:max-h-[55vh] pr-4">
              {currentTafsirText ? (
                <div
                  className="text-xs sm:text-sm leading-relaxed [&>p]:mb-3"
                  dangerouslySetInnerHTML={{ __html: currentTafsirText }}
                />
              ) : (
                <LoadingSpinner message="Memuat tafsir..." />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  );
};

export default SurahPage;
