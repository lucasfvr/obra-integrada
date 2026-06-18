import React, { createContext, useContext, useState } from 'react';

const RHSidebarContext = createContext();

export function RHSidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <RHSidebarContext.Provider value={{ collapsed, toggleCollapse }}>
      {children}
    </RHSidebarContext.Provider>
  );
}

export function useRHSidebar() {
  const context = useContext(RHSidebarContext);
  if (!context) {
    throw new Error('useRHSidebar must be used within RHSidebarProvider');
  }
  return context;
}
