import { Surah } from "@/types/quran";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface SurahCardProps {
  surah: Surah;
  index: number;
}

export function SurahCard({ surah, index }: SurahCardProps) {
  return (
    <Link
      to={`/surah/${surah.nomor}`}
      className="surah-card group block rounded-xl bg-card p-4 border border-border hover:border-quran-gold/50 transition-all duration-300"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Surah Number */}
        <div className="ayat-number shrink-0">
          {surah.nomor}
        </div>

        {/* Surah Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {surah.namaLatin}
              </h3>
              <p className="text-sm text-muted-foreground">
                {surah.arti}
              </p>
            </div>
            <div className="text-right">
              <p className="surah-name-arabic">{surah.nama}</p>
            </div>
          </div>
          
          {/* Meta Info */}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {surah.jumlahAyat} Ayat
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted">
              {surah.tempatTurun}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
