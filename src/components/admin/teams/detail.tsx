"use client";

import Link from "next/link";
import { Pencil, Trash } from "lucide-react";

import { deleteTeam } from "@/services/team";
import { FullTeam } from "@/types/db";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";

interface TeamDetailProps {
  team: FullTeam;
}

export function TeamDetail({ team }: TeamDetailProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{team.name}</CardTitle>
        <CardDescription>View and manage team details</CardDescription>
        {/* Action Buttons */}
        <CardAction>
          <div className="flex gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={`/admin/teams/${team.id}/edit`}>
                <Pencil />
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              className="hover:cursor-pointer"
              onClick={() => deleteTeam(team.id)}
            >
              <Trash />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Team Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold leading-none">
              Team Information
            </h3>
            <div className="divide-y">
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  School Name
                </dt>
                <dd className="text-sm">{team.school.name ?? "-"}</dd>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
