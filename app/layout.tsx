import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'trade.ai - AI Stock Market Assistant for Beginners',
  description: 'Understand market trends and stock insights powered by AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
