import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

interface ResponsiveLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  headerClassName?: string;
  withBottomNavPadding?: boolean;
}

export function ResponsiveLayout({
  children,
  showHeader = true,
  headerClassName,
  withBottomNavPadding = true,
}: ResponsiveLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - visible on lg+ screens */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - hidden on lg+ screens when sidebar is visible */}
        {showHeader && (
          <div className={`lg:hidden ${headerClassName || ""}`}>
            <Header />
          </div>
        )}

        {/* Page Content */}
        <main className={withBottomNavPadding ? "flex-1 pb-20 lg:pb-0" : "flex-1"}>
          {children}
        </main>

        {/* Bottom Nav - visible only on mobile/tablet */}
        <BottomNav />
      </div>
    </div>
  );
}
