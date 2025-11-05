import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export function NavigationBar() {
  return (
    <nav className="flex justify-between items-center px-4 sm:px-8 bg-primary border-b border-border">
      <div className="shrink-0">
        <Image
          src="/Logo.webp"
          alt="Bebras CTC Logo"
          width={100}
          height={40}
          unoptimized
          className="w-16 h-auto sm:w-20 md:w-24 lg:w-[100px]"
        />
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base">
        <Link
          href="/dashboard"
          className="text-primary-foreground hover:underline"
        >
          Dashboard
        </Link>
        <Link
          href="/leaderboard"
          className="text-primary-foreground hover:underline"
        >
          Leaderboard
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
