import { Sidebar } from "@/components/navigation/sidebar";

export default function JudgeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Sidebar>
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-full max-w-6xl space-y-4">{children}</div>
      </div>
    </Sidebar>
  );
}
