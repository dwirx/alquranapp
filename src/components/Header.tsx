import { Link } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import islamicPattern from "@/assets/islamic-pattern-header.jpg";

export function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${islamicPattern})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-quran-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-quran-gold/10 rounded-full blur-2xl" />
      </div>
      
      {/* Content */}
      <div className="relative container py-6 sm:py-8 md:py-10 lg:py-12">
        <Link to="/" className="inline-flex items-center gap-2 sm:gap-3 group">
          <div className="p-2 sm:p-2.5 rounded-xl bg-quran-gold/20 group-hover:bg-quran-gold/30 transition-all duration-300 group-hover:scale-105">
            <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-quran-gold" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground flex items-center gap-2">
              Al-Quran Digital
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-quran-gold animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-quran-gold-light">
              Baca, Dengar, Pahami
            </p>
          </div>
        </Link>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-quran-gold/50 to-transparent" />
    </header>
  );
}
