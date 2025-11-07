import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { fetchUnits, Unit } from '@/lib/data'; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axis",
  description: "Learning Platform",
};

export default async function RootLayout({ 
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const units: Unit[] = await fetchUnits(); 
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#F8FAFC] text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}