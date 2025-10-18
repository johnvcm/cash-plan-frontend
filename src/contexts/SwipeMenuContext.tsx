import { createContext, useContext, ReactNode } from "react";
import { useSwipeMenu } from "@/hooks/use-swipe-menu";

interface SwipeMenuContextType {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  swipeHandlers: ReturnType<typeof useSwipeMenu>["swipeHandlers"];
}

const SwipeMenuContext = createContext<SwipeMenuContextType | undefined>(undefined);

export function SwipeMenuProvider({ children }: { children: ReactNode }) {
  const { mobileMenuOpen, setMobileMenuOpen, swipeHandlers } = useSwipeMenu();

  return (
    <SwipeMenuContext.Provider value={{ mobileMenuOpen, setMobileMenuOpen, swipeHandlers }}>
      {children}
    </SwipeMenuContext.Provider>
  );
}

export function useSwipeMenuContext() {
  const context = useContext(SwipeMenuContext);
  if (!context) {
    throw new Error("useSwipeMenuContext must be used within SwipeMenuProvider");
  }
  return context;
}

