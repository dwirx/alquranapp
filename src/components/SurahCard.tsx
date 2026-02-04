import { Surah } from "@/types/quran";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";

interface SurahCardProps {
  surah: Surah;
  index: number;
}

export function SurahCard({ surah, index }: SurahCardProps) {
  return (
    <Link
      to={`/surah/${surah.nomor}`}
      className="surah-card group block rounded-xl bg-card p-3 sm:p-4 border border-border hover:border-quran-gold/50 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 20, 300)}ms` }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Surah Number */}
        <div className="ayat-number">
          {surah.nomor}
        </div>

        {/* Surah Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                {surah.namaLatin}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {surah.arti}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="surah-name-arabic">{surah.nama}</p>
            </div>
          </div>
          
          {/* Meta Info */}
          <div className="mt-2 flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span className="hidden xs:inline">{surah.jumlahAyat} Ayat</span>
              <span className="xs:hidden">{surah.jumlahAyat}</span>
            </span>
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-muted text-xs">
              {surah.tempatTurun}
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </Link>
  );
}
