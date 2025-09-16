'use client';

import { useState } from 'react';
import Navbar from '@/components/structure/Navbar';
import Sidebar from '@/components/structure/Sidebar';
import Footer from '@/components/structure/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen">
          <Sidebar isOpen={isSidebarOpen} />

          <div className="flex flex-col flex-1 transition-all duration-300">
            <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <main className="p-4 flex-1 overflow-auto bg-white">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
