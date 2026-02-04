import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import islamicPattern from "@/assets/islamic-pattern-header.jpg";

export function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${islamicPattern})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary/95" />
      
      {/* Content */}
      <div className="relative container py-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-quran-gold/20 group-hover:bg-quran-gold/30 transition-colors">
            <BookOpen className="h-8 w-8 text-quran-gold" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              Al-Quran Digital
            </h1>
            <p className="text-sm text-quran-gold-light">
              Baca, Dengar, Pahami
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
