import { Sidebar } from "@/components/navigation/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Sidebar>
      <ThemeToggle />
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-full max-w-6xl space-y-4">{children}</div>
      </div>
    </Sidebar>
  );
}
