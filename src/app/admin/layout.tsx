import { Sidebar } from "@/components/layout/sidebar/sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Sidebar>
      <div className="flex items-center justify-center h-full">{children}</div>
    </Sidebar>
  );
}
