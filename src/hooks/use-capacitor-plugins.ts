import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

export function useCapacitorPlugins() {
  const navigate = useNavigate();
  const location = useLocation();

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

    // Configurar Teclado e listeners
    const setupKeyboard = async () => {
      try {
        // Usar Body para melhor compatibilidade com modais e formulários web
        await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
        
        // Configurar comportamento de scroll quando teclado aparecer
        await Keyboard.setScroll({ isDisabled: false });
        
        // Configurar acessórios do teclado (barra de ferramentas)
        await Keyboard.setAccessoryBarVisible({ isVisible: false });

        // Listener para quando teclado aparecer
        const keyboardWillShow = await Keyboard.addListener('keyboardWillShow', (info) => {
          // Adicionar classe ao body quando teclado aparecer
          document.body.classList.add('keyboard-visible');
          document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
        });

        // Listener para quando teclado desaparecer
        const keyboardWillHide = await Keyboard.addListener('keyboardWillHide', () => {
          // Remover classe quando teclado desaparecer
          document.body.classList.remove('keyboard-visible');
          document.documentElement.style.setProperty('--keyboard-height', '0px');
        });

        // Retornar listeners para cleanup
        return { keyboardWillShow, keyboardWillHide };
      } catch (error) {
        console.error('Erro ao configurar Keyboard:', error);
        return null;
      }
    };

    // Configurar botão de voltar do Android
    const setupBackButton = async () => {
      try {
        const backButtonHandler = await CapApp.addListener('backButton', () => {
          // Se está na home ("/"), perguntar se quer sair
          if (location.pathname === '/') {
            // Mostrar confirmação para sair do app
            if (window.confirm('Deseja sair do aplicativo?')) {
              CapApp.exitApp();
            }
          } else {
            // Navegar para a página anterior
            navigate(-1);
          }
        });

        // Retornar listener para cleanup
        return backButtonHandler;
      } catch (error) {
        console.error('Erro ao configurar botão de voltar:', error);
        return null;
      }
    };

    // Inicializar tudo
    setupStatusBar();
    
    let keyboardListeners: { keyboardWillShow: any; keyboardWillHide: any } | null = null;
    setupKeyboard().then(listeners => {
      keyboardListeners = listeners;
    });
    
    let backButtonHandler: any = null;
    setupBackButton().then(handler => {
      backButtonHandler = handler;
    });

    // Cleanup
    return () => {
      if (backButtonHandler) {
        backButtonHandler.remove();
      }
      if (keyboardListeners) {
        keyboardListeners.keyboardWillShow.remove();
        keyboardListeners.keyboardWillHide.remove();
      }
    };
  }, [location.pathname, navigate]);
}

