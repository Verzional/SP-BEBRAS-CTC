export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl">{children}</div>
    </div>
  );
}
