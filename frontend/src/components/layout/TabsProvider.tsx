import React, { createContext, useContext } from 'react';

interface TabsContextType {
  // Define tabs context interface when needed
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProviderProps {
  children: React.ReactNode;
}

export const TabsProvider: React.FC<TabsProviderProps> = ({ children }) => {
  const value: TabsContextType = {
    // Implement tabs context value when needed
  };

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a TabsProvider');
  }
  return context;
};

export default TabsProvider;