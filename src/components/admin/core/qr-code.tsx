"use client";

import { Team } from "@/generated/client/client";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeProps {
  team: Team;
  size?: number;
}

export function QRCode({ team, size = 128 }: QRCodeProps) {
  return (
    <div className="flex items-center justify-center p-2 border border-gray-300 bg-white rounded">
      <QRCodeSVG value={team.id} size={size} level="H" />
    </div>
  );
}
