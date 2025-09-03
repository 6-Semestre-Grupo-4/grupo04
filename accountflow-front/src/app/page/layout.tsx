import '@/app/globals.css';
import Navbar from '@/components/structure/Navbar';
import Sidebar from '@/components/structure/Sidebar';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Navbar />
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
