import "./globals.css";
import { Toaster } from "@/components/layout/toaster";
import { Background } from "@/components/layout/background";
import { Provider } from "@/components/layout/theme-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
