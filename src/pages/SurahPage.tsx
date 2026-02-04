import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSurahDetail, fetchTafsir } from "@/services/quranApi";
import { Header } from "@/components/Header";
import { AyatCard } from "@/components/AyatCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Ayat } from "@/types/quran";
import { ArrowLeft, ArrowRight, BookOpen, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const SurahPage = () => {
  const { id } = useParams<{ id: string }>();
  const surahNumber = parseInt(id || "1", 10);

  const [currentAyat, setCurrentAyat] = useState<Ayat | null>(null);
  const [tafsirAyat, setTafsirAyat] = useState<number | null>(null);

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
    } else {
      setCurrentAyat(ayat);
    }
  }, [currentAyat]);

  const handleNextAyat = useCallback(() => {
    if (!surah || !currentAyat) return;
    const nextIndex = surah.ayat.findIndex(a => a.nomorAyat === currentAyat.nomorAyat) + 1;
    if (nextIndex < surah.ayat.length) {
      setCurrentAyat(surah.ayat[nextIndex]);
    }
  }, [surah, currentAyat]);

  const handlePreviousAyat = useCallback(() => {
    if (!surah || !currentAyat) return;
    const prevIndex = surah.ayat.findIndex(a => a.nomorAyat === currentAyat.nomorAyat) - 1;
    if (prevIndex >= 0) {
      setCurrentAyat(surah.ayat[prevIndex]);
    }
  }, [surah, currentAyat]);

  const currentTafsirText = tafsir?.tafsir.find(t => t.ayat === tafsirAyat)?.teks;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingSpinner message="Memuat surah..." />
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <ErrorMessage 
            message="Gagal memuat surah" 
            onRetry={() => refetch()} 
          />
        </div>
      </div>
    );
  }

  const currentAyatIndex = currentAyat 
    ? surah.ayat.findIndex(a => a.nomorAyat === currentAyat.nomorAyat)
    : -1;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <main className="container py-6">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Surah
        </Link>

        {/* Surah Header */}
        <div className="islamic-border bg-card p-6 md:p-8 mb-6">
          <div className="text-center">
            <h1 className="surah-name-arabic text-3xl md:text-4xl mb-2">
              {surah.nama}
            </h1>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {surah.namaLatin}
            </h2>
            <p className="text-muted-foreground mb-4">{surah.arti}</p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {surah.jumlahAyat} Ayat
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {surah.tempatTurun}
              </span>
            </div>
          </div>

          {/* Surah Description */}
          {surah.deskripsi && (
            <div 
              className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: surah.deskripsi }}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          {surah.suratSebelumnya ? (
            <Link to={`/surah/${surah.suratSebelumnya.nomor}`}>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{surah.suratSebelumnya.namaLatin}</span>
                <span className="sm:hidden">Sebelumnya</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}
          
          {surah.suratSelanjutnya && (
            <Link to={`/surah/${surah.suratSelanjutnya.nomor}`}>
              <Button variant="outline" className="gap-2">
                <span className="hidden sm:inline">{surah.suratSelanjutnya.namaLatin}</span>
                <span className="sm:hidden">Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Bismillah (if not Al-Fatihah or At-Taubah) */}
        {surahNumber !== 1 && surahNumber !== 9 && (
          <div className="text-center py-8 mb-6">
            <p className="arabic-text-lg text-quran-gold">
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
          </div>
        )}

        {/* Ayat List */}
        <div className="space-y-4">
          {surah.ayat.map((ayat) => (
            <AyatCard
              key={ayat.nomorAyat}
              ayat={ayat}
              onPlayAudio={handlePlayAudio}
              isPlaying={currentAyat?.nomorAyat === ayat.nomorAyat}
              onShowTafsir={setTafsirAyat}
            />
          ))}
        </div>
      </main>

      {/* Floating Audio Player */}
      {currentAyat && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border">
          <div className="container">
            <AudioPlayer
              ayat={currentAyat}
              onNext={handleNextAyat}
              onPrevious={handlePreviousAyat}
              hasNext={currentAyatIndex < surah.ayat.length - 1}
              hasPrevious={currentAyatIndex > 0}
            />
          </div>
        </div>
      )}

      {/* Tafsir Modal */}
      <Dialog open={tafsirAyat !== null} onOpenChange={() => setTafsirAyat(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Tafsir Ayat {tafsirAyat}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {currentTafsirText ? (
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentTafsirText }}
              />
            ) : (
              <LoadingSpinner message="Memuat tafsir..." />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SurahPage;
