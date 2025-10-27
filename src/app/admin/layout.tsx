import { Sidebar } from "@/components/layout/sidebar/sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Sidebar>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full max-w-2xl space-y-4">{children}</div>
      </div>
    </Sidebar>
  );
}
