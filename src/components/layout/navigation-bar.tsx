import Image from "next/image";

export function NavigationBar() {
  return (
    <nav className="flex justify-between items-center px-4 sm:px-8 bg-top-bar-primary border-b border-border">
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
    </nav>
  );
}
