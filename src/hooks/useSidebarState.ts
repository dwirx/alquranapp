import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useLocalStorage("sidebar-collapsed", false);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, [setIsCollapsed]);

  const collapse = useCallback(() => {
    setIsCollapsed(true);
  }, [setIsCollapsed]);

  const expand = useCallback(() => {
    setIsCollapsed(false);
  }, [setIsCollapsed]);

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
  };
}
