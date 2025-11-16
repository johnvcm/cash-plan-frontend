import { useState } from "react";
import { useSwipeable } from "react-swipeable";

export function useSwipeMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      // Abre menu com swipe para direita (em qualquer lugar da tela)
      if (window.innerWidth < 1024 && !mobileMenuOpen) {
        setMobileMenuOpen(true);
      }
    },
    onSwipedLeft: () => {
      // Fecha o menu se já estiver aberto
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 80,
    preventScrollOnSwipe: false,
    touchEventOptions: { passive: true },
  });

  return {
    mobileMenuOpen,
    setMobileMenuOpen,
    swipeHandlers,
  };
}

