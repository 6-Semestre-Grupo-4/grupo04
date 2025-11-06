import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-gray-50 dark:bg-[#0f1419] text-gray-900 dark:text-gray-100`}>{children}</body>
    </html>
  );
}
