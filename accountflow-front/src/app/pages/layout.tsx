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
    <div className="bg-background flex h-screen">
      {mounted && <SidebarComponent isOpen={isSidebarOpen} />}

      {isSidebarOpen && mounted && (
        <div
          className="fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col transition-all duration-300 lg:ml-64">
        <header className="card-enhanced border-border z-20 border-b">
          <NavbarComponent onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        </header>
        <main
          className="flex-1 overflow-auto p-6 transition-all duration-300"
          style={{ background: 'var(--background)', color: 'var(--color-text)' }}
        >
          <div className="animate-[fade-in_0.5s_ease-in-out]">{children}</div>
        </main>
      </div>
    </div>
  );
}
