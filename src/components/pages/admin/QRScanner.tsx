"use client";

import { getQuestionForTeam } from "@/services/question";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

interface IDetectedBarcode {
  boundingBox: { x: number; y: number; width: number; height: number };
  cornerPoints: { x: number; y: number }[];
  format: string;
  rawValue: string;
}

export default function QRScanner() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!loading && detectedCodes.length > 0) {
      setLoading(true);
      setError(null);
      const teamId = detectedCodes[0].rawValue;

      const response = await getQuestionForTeam(teamId);

      if (response.error) {
        setError(response.error);
        setLoading(false);
      } else if (response.questionId) {
        router.push(`/question/${response.questionId}`);
      }
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error && error.name === "NotAllowedError") {
      setError("Camera permission is required to scan.");
    } else {
      setError("An unknown camera error occurred.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h1>Scan Team QR Code</h1>
      <Scanner
        onScan={handleScan}
        onError={handleError}
        constraints={{
          facingMode: "environment",
        }}
        styles={{
          container: { width: "100%", paddingTop: "56.25%" },
        }}
      />

      {loading && <p>Loading question...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
