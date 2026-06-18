import React from 'react';
import { Outlet } from 'react-router';
import RHSidebar from '../layout/RHSidebar';
import { RHSidebarProvider } from '../context/RHSidebarContext';

export default function RHLayout({ children }) {
  return (
    <RHSidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar RH */}
        <RHSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto scrollbar-elegant">
          <Outlet />
        </div>
      </div>
    </RHSidebarProvider>
  );
}
