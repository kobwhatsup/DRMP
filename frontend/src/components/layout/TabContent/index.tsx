import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Empty } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useTabStore, useActiveTab } from '@/store/tabStore';
import styles from './style.module.scss';

interface CachedComponent {
  component: React.ReactNode;
  scrollPosition: number;
  timestamp: number;
}

interface TabContentProps {
  children: React.ReactNode;
}

const TabContent: React.FC<TabContentProps> = ({ children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { tabs, activeTabId, saveScrollPosition } = useTabStore();
  const activeTab = useActiveTab();
  const [cachedComponents, setCachedComponents] = useState<Map<string, CachedComponent>>(new Map());

  // Save scroll position when tab changes
  useEffect(() => {
    const saveCurrentScrollPosition = () => {
      if (contentRef.current && activeTabId) {
        const scrollPosition = contentRef.current.scrollTop;
        saveScrollPosition(activeTabId, scrollPosition);
      }
    };

    return () => {
      saveCurrentScrollPosition();
    };
  }, [activeTabId, saveScrollPosition]);

  // Restore scroll position when tab becomes active
  useEffect(() => {
    if (contentRef.current && activeTab?.scrollPosition !== undefined) {
      contentRef.current.scrollTop = activeTab.scrollPosition;
    }
  }, [activeTab]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current && activeTabId) {
        const scrollPosition = contentRef.current.scrollTop;
        saveScrollPosition(activeTabId, scrollPosition);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        contentElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [activeTabId, saveScrollPosition]);

  // Cache management - cache current content
  useEffect(() => {
    if (activeTabId && children) {
      setCachedComponents(prev => {
        const newCache = new Map(prev);
        newCache.set(activeTabId, {
          component: children,
          scrollPosition: contentRef.current?.scrollTop || 0,
          timestamp: Date.now(),
        });

        // Clean up old cache entries (keep max 10 tabs cached)
        if (newCache.size > 10) {
          const sortedEntries = Array.from(newCache.entries())
            .sort((a, b) => b[1].timestamp - a[1].timestamp);
          const entriesToKeep = sortedEntries.slice(0, 10);
          return new Map(entriesToKeep);
        }

        return newCache;
      });
    }
  }, [activeTabId, children]);

  // Get current content (from cache or fresh)
  const currentContent = useMemo(() => {
    if (activeTabId) {
      const cached = cachedComponents.get(activeTabId);
      if (cached) {
        return cached.component;
      }
    }
    return children;
  }, [activeTabId, children, cachedComponents]);

  // Clean up cache when tabs are closed
  useEffect(() => {
    const tabIds = new Set(tabs.map(t => t.id));
    setCachedComponents(prev => {
      const newCache = new Map();
      prev.forEach((value, key) => {
        if (tabIds.has(key)) {
          newCache.set(key, value);
        }
      });
      return newCache;
    });
  }, [tabs]);

  // Render empty state when no tabs
  if (tabs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Empty
          image={<FileTextOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
          description={
            <div>
              <div style={{ fontSize: 16, marginBottom: 8 }}>暂无打开的标签页</div>
              <div style={{ fontSize: 14, color: '#999' }}>
                点击左侧菜单项或使用 Ctrl+T 打开新标签页
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // Render content
  return (
    <div
      ref={contentRef}
      className={styles.tabContent}
      style={{ display: activeTabId ? 'block' : 'none' }}
    >
      {currentContent}
    </div>
  );
};

// HOC for wrapping page components with keep-alive functionality
export const withKeepAlive = (Component: React.ComponentType<any>) => {
  return React.memo((props: any) => {
    const componentRef = useRef<any>(null);
    const [componentState, setComponentState] = useState<any>({});
    const { activeTabId } = useTabStore();

    // Save component state when tab changes
    useEffect(() => {
      return () => {
        if (componentRef.current && typeof componentRef.current.getState === 'function') {
          const currentState = componentRef.current.getState();
          setComponentState(currentState);
        }
      };
    }, [activeTabId]);

    // Restore component state when tab becomes active
    useEffect(() => {
      if (componentRef.current && typeof componentRef.current.setState === 'function' && componentState) {
        componentRef.current.setState(componentState);
      }
    }, [componentState, activeTabId]);

    return <Component ref={componentRef} {...props} initialState={componentState} />;
  });
};

export default TabContent;