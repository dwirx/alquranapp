import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MasterDetailLayoutProps {
  master: ReactNode;
  detail: ReactNode;
  emptyDetail?: ReactNode;
  showDetail?: boolean;
  masterClassName?: string;
  detailClassName?: string;
}

export function MasterDetailLayout({
  master,
  detail,
  emptyDetail,
  showDetail = true,
  masterClassName,
  detailClassName,
}: MasterDetailLayoutProps) {
  return (
    <div className="flex h-full">
      {/* Master Panel - always visible on desktop, hidden when detail shown on mobile */}
      <div
        className={cn(
          "w-full lg:w-[360px] lg:min-w-[360px] lg:max-w-[360px] border-r border-border overflow-y-auto",
          "lg:block",
          showDetail && "hidden lg:block",
          masterClassName
        )}
      >
        {master}
      </div>

      {/* Detail Panel - visible when item selected on mobile, always visible on desktop */}
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          "lg:block",
          !showDetail && "hidden lg:block",
          detailClassName
        )}
      >
        {showDetail ? detail : emptyDetail}
      </div>
    </div>
  );
}

// Empty state component for detail panel
export function EmptyDetailState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        {icon && (
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
