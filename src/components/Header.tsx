import { Link, useLocation } from "react-router-dom";
import { BookOpen, Sparkles, Clock, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import islamicPattern from "@/assets/islamic-pattern-header.jpg";

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Al-Quran", icon: BookOpen },
    { path: "/jadwal-shalat", label: "Jadwal Shalat", icon: Clock },
  ];

  const isActive = (path: string) => location.pathname === path;

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
      <div className="relative container py-4 sm:py-6 md:py-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 sm:gap-3 group">
            <div className="p-2 sm:p-2.5 rounded-xl bg-quran-gold/20 group-hover:bg-quran-gold/30 transition-all duration-300 group-hover:scale-105">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-quran-gold" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-foreground flex items-center gap-2">
                Al-Quran Digital
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-quran-gold animate-pulse" />
              </h1>
              <p className="text-xs text-quran-gold-light hidden sm:block">
                Baca, Dengar, Pahami
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant="ghost"
                  className={`
                    gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10
                    ${isActive(path) ? 'bg-primary-foreground/15 text-primary-foreground' : ''}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-primary-foreground/20 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link 
                  key={path} 
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`
                      w-full justify-start gap-3 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10
                      ${isActive(path) ? 'bg-primary-foreground/15 text-primary-foreground' : ''}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-quran-gold/50 to-transparent" />
    </header>
  );
}
