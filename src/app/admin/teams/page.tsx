import prisma from "@/lib/prisma";
import { QRCodeSVG } from "qrcode.react";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany();

  return (
    <div>
      <h1>Team QR Codes</h1>
      {teams.map((team) => (
        <div
          key={team.id}
          style={{ padding: "20px", border: "1px solid #ccc" }}
        >
          <h2>{team.name}</h2>
          <QRCodeSVG value={team.id} size={256} level="H" />
          <p>{team.id}</p>
        </div>
      ))}
    </div>
  );
}
