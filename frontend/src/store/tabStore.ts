import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import React from 'react';

export interface Tab {
  id: string;
  title: string;
  path: string;
  icon?: React.ReactNode;
  closable: boolean;
  isFixed?: boolean;
  params?: Record<string, any>;
  state?: any;
  scrollPosition?: number;
  formData?: any;
  lastActiveTime?: number;
}

interface TabStore {
  // State
  tabs: Tab[];
  activeTabId: string | null;
  recentlyClosed: Tab[];
  maxTabs: number;

  // Basic operations
  addTab: (tab: Omit<Tab, 'id'>) => string;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  toggleFixTab: (tabId: string) => void;
  restoreClosedTab: () => void;
  getTabByPath: (path: string) => Tab | undefined;

  // Batch operations
  removeOtherTabs: (tabId: string) => void;
  removeTabsToRight: (tabId: string) => void;
  removeTabsToLeft: (tabId: string) => void;
  removeAllTabs: () => void;

  // State management
  saveTabState: (tabId: string, state: any) => void;
  saveScrollPosition: (tabId: string, position: number) => void;
  saveFormData: (tabId: string, formData: any) => void;
}

const STORAGE_KEY = 'drmp-tabs-state';
const MAX_RECENTLY_CLOSED = 10;
const DEFAULT_MAX_TABS = 20;

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      recentlyClosed: [],
      maxTabs: DEFAULT_MAX_TABS,

      addTab: (tabData) => {
        const { tabs, maxTabs, setActiveTab } = get();

        // Check if tab with same path already exists
        const existingTab = tabs.find(t => t.path === tabData.path);
        if (existingTab) {
          setActiveTab(existingTab.id);
          return existingTab.id;
        }

        // Check max tabs limit
        if (tabs.length >= maxTabs) {
          // Remove the least recently used non-fixed tab
          const nonFixedTabs = tabs.filter(t => !t.isFixed);
          if (nonFixedTabs.length > 0) {
            const lruTab = nonFixedTabs.sort((a, b) =>
              (a.lastActiveTime || 0) - (b.lastActiveTime || 0)
            )[0];
            get().removeTab(lruTab.id);
          } else {
            console.warn('Maximum tabs reached and all tabs are fixed');
            return '';
          }
        }

        // Create new tab
        const newTab: Tab = {
          ...tabData,
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          closable: tabData.closable !== false,
          lastActiveTime: Date.now(),
        };

        set(state => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }));

        return newTab.id;
      },

      removeTab: (tabId) => {
        const { tabs, activeTabId, recentlyClosed } = get();
        const tabIndex = tabs.findIndex(t => t.id === tabId);

        if (tabIndex === -1) return;

        const tabToRemove = tabs[tabIndex];

        // Don't remove fixed tabs unless it's the only tab
        if (tabToRemove.isFixed && tabs.length > 1) {
          console.warn('Cannot close fixed tab');
          return;
        }

        // Add to recently closed (excluding fixed tabs)
        if (!tabToRemove.isFixed) {
          const newRecentlyClosed = [
            tabToRemove,
            ...recentlyClosed.filter(t => t.id !== tabToRemove.id)
          ].slice(0, MAX_RECENTLY_CLOSED);

          set(state => ({
            recentlyClosed: newRecentlyClosed,
          }));
        }

        const newTabs = tabs.filter(t => t.id !== tabId);

        // Determine new active tab
        let newActiveTabId = activeTabId;
        if (activeTabId === tabId) {
          if (newTabs.length > 0) {
            // Select the tab to the right, or left if it was the last tab
            const newIndex = Math.min(tabIndex, newTabs.length - 1);
            newActiveTabId = newTabs[newIndex].id;
          } else {
            newActiveTabId = null;
          }
        }

        set({
          tabs: newTabs,
          activeTabId: newActiveTabId,
        });
      },

      setActiveTab: (tabId) => {
        const { tabs } = get();
        const tab = tabs.find(t => t.id === tabId);

        if (tab) {
          set(state => ({
            activeTabId: tabId,
            tabs: state.tabs.map(t =>
              t.id === tabId
                ? { ...t, lastActiveTime: Date.now() }
                : t
            ),
          }));
        }
      },

      updateTab: (tabId, updates) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === tabId ? { ...tab, ...updates } : tab
          ),
        }));
      },

      moveTab: (fromIndex, toIndex) => {
        const { tabs } = get();
        if (
          fromIndex < 0 ||
          fromIndex >= tabs.length ||
          toIndex < 0 ||
          toIndex >= tabs.length
        ) {
          return;
        }

        const newTabs = [...tabs];
        const [movedTab] = newTabs.splice(fromIndex, 1);
        newTabs.splice(toIndex, 0, movedTab);

        set({ tabs: newTabs });
      },

      toggleFixTab: (tabId) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === tabId
              ? { ...tab, isFixed: !tab.isFixed }
              : tab
          ),
        }));
      },

      restoreClosedTab: () => {
        const { recentlyClosed, addTab } = get();
        if (recentlyClosed.length === 0) return;

        const [tabToRestore, ...remainingClosed] = recentlyClosed;

        // Remove id to let addTab generate a new one
        const { id, ...tabData } = tabToRestore;
        addTab(tabData);

        set({ recentlyClosed: remainingClosed });
      },

      getTabByPath: (path) => {
        const { tabs } = get();
        return tabs.find(t => t.path === path);
      },

      removeOtherTabs: (tabId) => {
        const { tabs } = get();
        const tabToKeep = tabs.find(t => t.id === tabId);
        if (!tabToKeep) return;

        const fixedTabs = tabs.filter(t => t.isFixed && t.id !== tabId);

        set({
          tabs: [...fixedTabs, tabToKeep],
          activeTabId: tabId,
        });
      },

      removeTabsToRight: (tabId) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const tabsToKeep = tabs.slice(0, tabIndex + 1);
        const fixedTabsOnRight = tabs.slice(tabIndex + 1).filter(t => t.isFixed);

        const newTabs = [...tabsToKeep, ...fixedTabsOnRight];

        // Adjust active tab if it was removed
        const newActiveTabId = newTabs.find(t => t.id === activeTabId)
          ? activeTabId
          : tabId;

        set({
          tabs: newTabs,
          activeTabId: newActiveTabId,
        });
      },

      removeTabsToLeft: (tabId) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const fixedTabsOnLeft = tabs.slice(0, tabIndex).filter(t => t.isFixed);
        const tabsToKeep = tabs.slice(tabIndex);

        const newTabs = [...fixedTabsOnLeft, ...tabsToKeep];

        // Adjust active tab if it was removed
        const newActiveTabId = newTabs.find(t => t.id === activeTabId)
          ? activeTabId
          : tabId;

        set({
          tabs: newTabs,
          activeTabId: newActiveTabId,
        });
      },

      removeAllTabs: () => {
        const { tabs } = get();
        const fixedTabs = tabs.filter(t => t.isFixed);

        set({
          tabs: fixedTabs,
          activeTabId: fixedTabs.length > 0 ? fixedTabs[0].id : null,
        });
      },

      saveTabState: (tabId, state) => {
        get().updateTab(tabId, { state });
      },

      saveScrollPosition: (tabId, position) => {
        get().updateTab(tabId, { scrollPosition: position });
      },

      saveFormData: (tabId, formData) => {
        get().updateTab(tabId, { formData });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        tabs: state.tabs.map(tab => ({
          ...tab,
          icon: undefined, // Don't persist React components
          state: undefined, // Don't persist component state for now
          formData: undefined, // Don't persist form data for security
        })),
        activeTabId: state.activeTabId,
      }),
    }
  )
);

// Helper hook for getting the active tab
export const useActiveTab = () => {
  const { tabs, activeTabId } = useTabStore();
  return tabs.find(t => t.id === activeTabId);
};