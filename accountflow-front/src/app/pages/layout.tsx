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
    <div className="flex h-screen" style={{ background: 'var(--background)' }}>
      {mounted && <SidebarComponent isOpen={isSidebarOpen} />}

      {isSidebarOpen && mounted && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:ml-50 transition-all duration-300">
        <header className="card-enhanced border-b border-[var(--color-border)] z-20">
          <NavbarComponent onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        </header>
        <main
          className="flex-1 p-6 overflow-auto transition-all duration-300"
          style={{ background: 'var(--background)', color: 'var(--color-text)' }}
        >
          <div className="animate-[fade-in_0.5s_ease-in-out]">{children}</div>
        </main>
      </div>
    </div>
  );
}
