import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabStore } from '@/store/tabStore';

export const useTabShortcuts = () => {
  const navigate = useNavigate();
  const {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    restoreClosedTab,
  } = useTabStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + W: Close current tab
      if (modifierKey && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) {
          removeTab(activeTabId);
        }
      }

      // Ctrl/Cmd + T: Open new tab
      if (modifierKey && e.key === 't') {
        e.preventDefault();
        const id = addTab({
          title: '工作台',
          path: '/dashboard',
          closable: true,
        });
        navigate('/dashboard');
      }

      // Ctrl/Cmd + Shift + T: Restore recently closed tab
      if (modifierKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        restoreClosedTab();
      }

      // Ctrl/Cmd + Tab: Next tab
      if (modifierKey && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        if (tabs[nextIndex]) {
          setActiveTab(tabs[nextIndex].id);
          navigate(tabs[nextIndex].path);
        }
      }

      // Ctrl/Cmd + Shift + Tab: Previous tab
      if (modifierKey && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const prevIndex = currentIndex - 1 < 0 ? tabs.length - 1 : currentIndex - 1;
        if (tabs[prevIndex]) {
          setActiveTab(tabs[prevIndex].id);
          navigate(tabs[prevIndex].path);
        }
      }

      // Ctrl/Cmd + 1-9: Switch to tab by number
      if (modifierKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (tabs[index]) {
          setActiveTab(tabs[index].id);
          navigate(tabs[index].path);
        }
      }

      // Alt + Left/Right: Navigate back/forward (browser-like)
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabs, activeTabId, addTab, removeTab, setActiveTab, restoreClosedTab, navigate]);

  return null;
};