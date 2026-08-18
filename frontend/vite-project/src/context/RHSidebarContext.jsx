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

// Provider + hook no mesmo arquivo e o padrao normal de Context no React. A regra
// abaixo so reclama de perda de hot-reload em dev; separar em dois arquivos nao
// traria beneficio real aqui.
// eslint-disable-next-line react-refresh/only-export-components
export function useRHSidebar() {
  const context = useContext(RHSidebarContext);
  if (!context) {
    throw new Error('useRHSidebar must be used within RHSidebarProvider');
  }
  return context;
}
