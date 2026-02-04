import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Moon, Clock, Bookmark, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/useSidebarState";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import faviconLogo from "/favicon.png";

const navItems = [
  { path: "/", icon: Home, label: "Beranda" },
  { path: "/doa", icon: BookOpen, label: "Doa Harian" },
  { path: "/imsakiyah", icon: Moon, label: "Imsakiyah" },
  { path: "/jadwal-shalat", icon: Clock, label: "Waktu Shalat" },
  { path: "/bookmark", icon: Bookmark, label: "Bookmark" },
];

const bottomNavItems = [
  { path: "/settings", icon: Settings, label: "Pengaturan" },
];

export function AppSidebar() {
  const location = useLocation();
  const { isCollapsed, toggle } = useSidebarState();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen bg-card border-r border-border transition-all duration-200 ease-out sticky top-0",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-border",
        isCollapsed && "justify-center"
      )}>
        <img
          src={faviconLogo}
          alt="Al-Quran Digital"
          className="h-8 w-8 rounded-lg flex-shrink-0"
        />
        {!isCollapsed && (
          <span className="font-semibold text-foreground truncate">
            Al-Quran Digital
          </span>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);

          if (isCollapsed) {
            return (
              <Tooltip key={path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={path}
                    className={cn(
                      "flex items-center justify-center h-10 w-full rounded-lg transition-colors",
                      active
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-lg transition-colors",
                active
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-sm font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-border space-y-1">
        {bottomNavItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);

          if (isCollapsed) {
            return (
              <Tooltip key={path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={path}
                    className={cn(
                      "flex items-center justify-center h-10 w-full rounded-lg transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-lg transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-sm font-medium">{label}</span>
            </Link>
          );
        })}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className={cn(
            "w-full h-10 justify-center text-muted-foreground hover:text-foreground",
            !isCollapsed && "justify-start px-3"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3 text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
