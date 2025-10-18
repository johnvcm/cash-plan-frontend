import React, { createContext, useContext, ReactNode } from 'react';
import { useSwipeMenu } from '@/hooks/use-swipe-menu';
import { SwipeableHandlers } from 'react-swipeable';

interface SwipeMenuContextType {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  swipeHandlers: SwipeableHandlers;
}

const SwipeMenuContext = createContext<SwipeMenuContextType | undefined>(undefined);

export function SwipeMenuProvider({ children }: { children: ReactNode }) {
  const { mobileMenuOpen, setMobileMenuOpen, swipeHandlers } = useSwipeMenu();

  return (
    <SwipeMenuContext.Provider
      value={{ mobileMenuOpen, setMobileMenuOpen, swipeHandlers }}
    >
      {children}
    </SwipeMenuContext.Provider>
  );
}

export function useSwipeMenuContext() {
  const context = useContext(SwipeMenuContext);
  if (context === undefined) {
    throw new Error('useSwipeMenuContext must be used within a SwipeMenuProvider');
  }
  return context;
}

