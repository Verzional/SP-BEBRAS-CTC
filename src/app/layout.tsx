import "./globals.css";
import Provider from "@/components/layout/ThemeProvider";
import Background from "@/components/layout/Background";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bebras - CTC",
  description: "Bebras Computational Thinking Challenge @ UC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <Background />
          <ThemeToggle />
          {children}
        </Provider>
      </body>
    </html>
  );
}
