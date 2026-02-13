import { Link, useLocation } from "react-router-dom";
import { Home, Clock, BookOpen, Settings, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Beranda" },
  { path: "/chat", icon: MessageSquareText, label: "AI Chat" },
  { path: "/doa", icon: BookOpen, label: "Doa" },
  { path: "/jadwal-shalat", icon: Clock, label: "Shalat" },
  { path: "/settings", icon: Settings, label: "Pengaturan" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden h-[var(--bottom-nav-height)]">
      {/* Background - Solid Light Theme */}
      <div className="absolute inset-0 bg-background border-t border-border shadow-up" />

      {/* Navigation Items */}
      <div className="relative h-full flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                "min-w-[64px] touch-target",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-primary"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
