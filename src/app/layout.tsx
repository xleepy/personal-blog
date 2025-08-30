import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Roboto } from "next/font/google";
import { AppCanvas } from "@/components/AppCanvas";

const roboto = Roboto({
  subsets: ["latin"],
  display: "fallback",
  style: "normal",
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-family",
});

export const metadata: Metadata = {
  title: "Welcome to blog",
  description: "Welcome to my blog generated with Next",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full">
      <body
        className={`${roboto.variable} antialiased container mx-auto h-full text-black-200 flex flex-col p-4`}
      >
        <Header />
        <main className="h-full w-full pt-8">{children}</main>
        <AppCanvas />
      </body>
    </html>
  );
}
