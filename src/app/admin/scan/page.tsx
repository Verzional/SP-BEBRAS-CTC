import QRScanner from "@/components/pages/admin/QRScanner";

export default function ScanPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <div className="w-full max-w-lg">
        <QRScanner />
      </div>
    </div>
  );
}
