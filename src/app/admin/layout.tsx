import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Sidebar>{children}</Sidebar>;
}
