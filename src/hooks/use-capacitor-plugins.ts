import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

export function useCapacitorPlugins() {
  useEffect(() => {
    // Só executar em plataformas nativas (não no browser)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Configurar Status Bar
    const setupStatusBar = async () => {
      try {
        // Usar estilo CLARO (ícones escuros em fundo claro) - para apps com fundo branco
        await StatusBar.setStyle({ style: Style.Light });
        
        // Cor de fundo da status bar (branco/transparente para seguir o tema)
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
        
        // Mostrar status bar
        await StatusBar.show();
        
        // Sobrepor conteúdo (opcional - para status bar translúcida)
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        console.error('Erro ao configurar Status Bar:', error);
      }
    };

    // Configurar Teclado
    const setupKeyboard = async () => {
      try {
        // Não redimensionar a viewport quando o teclado aparecer
        await Keyboard.setResizeMode({ mode: 'native' });
      } catch (error) {
        console.error('Erro ao configurar Keyboard:', error);
      }
    };

    setupStatusBar();
    setupKeyboard();
  }, []);
}

