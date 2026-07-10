import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { AppCanvas } from "@/components/AppCanvas";
import WeatherWidget from "@/components/WeatherWidget";

export const metadata: Metadata = {
  title: "My Blog 98",
  description: "A personal blog inspired by the Windows 98 desktop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="win98-page min-h-full w-full">
        <Header />
        <main className="relative z-10 min-h-dvh w-full pb-12">{children}</main>
        <AppCanvas />
        <WeatherWidget />
      </body>
    </html>
  );
}
