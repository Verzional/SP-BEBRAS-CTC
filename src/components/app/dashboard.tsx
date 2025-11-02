"use client";

import { signOut } from "next-auth/react";
import { QRCode } from "@/components/admin/core/qr-code";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Team {
  id: string;
  name: string;
  score: number;
  school: {
    id: string;
    name: string;
  };
  members: {
    id: string;
    name: string;
  }[];
}

interface DashboardProps {
  team: Team;
}

export function Dashboard({ team }: DashboardProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        <Button onClick={() => signOut()} variant="outline">
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Team Information
              <Badge variant="secondary">Score: {team.score}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{team.name}</h3>
              <p className="text-muted-foreground">{team.school.name}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Team Members:</h4>
              <div className="space-y-1">
                {team.members.map((member) => (
                  <div key={member.id} className="text-sm">
                    • {member.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle>Team QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <QRCode team={team} size={200} />
            <p className="text-sm text-muted-foreground text-center">
              Show this QR code to the admin to get questions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Show your QR code to the admin when prompted</li>
            <li>Answer the questions that appear</li>
            <li>
              Earn points for correct answers, lose points for incorrect ones
            </li>
            <li>Check your score here on the dashboard</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
