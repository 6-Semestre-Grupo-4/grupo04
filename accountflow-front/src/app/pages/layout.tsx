'use client';
import { useState, useEffect } from 'react';
import { SidebarComponent } from '@/components/structure/Sidebar';
import { NavbarComponent } from '@/components/structure/Navbar';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen">
      {mounted && <SidebarComponent isOpen={isSidebarOpen} />}

      {isSidebarOpen && mounted && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col md:ml-50">
        <header>
          <NavbarComponent onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        </header>
        <main className="flex-1 bg-white dark:bg-white p-5 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
