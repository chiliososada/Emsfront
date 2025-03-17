
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div 
        className={`h-full transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
      >
        <Sidebar collapsed={collapsed} />
      </div>
      
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm shadow-sm border-b border-border">
          <button 
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-border transition-colors hover:bg-muted"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        
        <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
