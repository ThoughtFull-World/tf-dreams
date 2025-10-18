import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "ThoughtFull Dreams",
  description: "Turn your morning dreams into magical videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-hidden">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 h-screen relative overflow-hidden`}>
        {/* Vibrant waves background (like reference) */}
        <div className="fixed inset-0 bg-vibrant-waves pointer-events-none" />
        
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
