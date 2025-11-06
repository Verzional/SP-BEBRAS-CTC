"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { getQuestionForTeam } from "@/services/question";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [level, setLevel] = useState<"SMP" | "SMA" | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<
    "EASY" | "MEDIUM" | "HARD" | undefined
  >(undefined);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!loading && detectedCodes.length > 0) {
      setLoading(true);
      setError(null);
      const teamId = detectedCodes[0].rawValue;

      console.log("QR Scanner - Scanning team:", teamId);
      console.log("QR Scanner - Current filters - Level:", level, "Difficulty:", difficulty);

      const response = await getQuestionForTeam(teamId, level, difficulty);

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
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 flex flex-col items-center">
          <Label htmlFor="level-select" className="text-center block">
            Level
          </Label>
          <Select
            value={level || "none"}
            onValueChange={(value) =>
              setLevel(value === "none" ? undefined : (value as "SMP" | "SMA"))
            }
          >
            <SelectTrigger id="level-select" className="text-center">
              <SelectValue placeholder="Select level (All)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-center">
                All Levels
              </SelectItem>
              <SelectItem value="SMP" className="text-center">
                SMP
              </SelectItem>
              <SelectItem value="SMA" className="text-center">
                SMA
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex flex-col items-center">
          <Label htmlFor="difficulty-select" className="text-center block">
            Difficulty
          </Label>
          <Select
            value={difficulty || "none"}
            onValueChange={(value) =>
              setDifficulty(
                value === "none"
                  ? undefined
                  : (value as "EASY" | "MEDIUM" | "HARD")
              )
            }
          >
            <SelectTrigger id="difficulty-select" className="text-center">
              <SelectValue placeholder="Select difficulty (All)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-center">
                All Difficulties
              </SelectItem>
              <SelectItem value="EASY" className="text-center">
                Easy
              </SelectItem>
              <SelectItem value="MEDIUM" className="text-center">
                Medium
              </SelectItem>
              <SelectItem value="HARD" className="text-center">
                Hard
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Scanner
        onScan={handleScan}
        onError={handleError}
        constraints={{
          facingMode: "environment",
        }}
        styles={{
          container: { width: "60%" },
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
    </div>
  );
}
