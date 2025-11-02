"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { getQuestionForTeam } from "@/services/question";

interface IPoint {
  x: number;
  y: number;
}

interface IBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IDetectedBarcode {
  boundingBox: IBoundingBox;
  cornerPoints: IPoint[];
  format: string;
  rawValue: string;
}

export function QRScanner() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!loading && detectedCodes.length > 0) {
      setLoading(true);
      setError(null);
      const teamId = detectedCodes[0].rawValue;

      const response = await getQuestionForTeam(teamId);

      if (response.error) {
        setError(response.error);
      }

      setLoading(false);
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
    <>
      <Scanner
        onScan={handleScan}
        onError={handleError}
        constraints={{
          facingMode: "environment",
        }}
        styles={{
          container: { width: "100%" },
          video: {
            transform: "scaleX(-1)",
          },
        }}
      />

      {loading && (
        <p className="text-center mt-4 font-medium">Loading question...</p>
      )}
      {error && (
        <p className="text-center mt-4 text-destructive font-medium">{error}</p>
      )}
    </>
  );
}
