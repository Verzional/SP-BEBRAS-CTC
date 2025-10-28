"use client";

import Link from "next/link";
import { Pencil, Trash } from "lucide-react";

import { deleteMember } from "@/services/member";
import { FullMember } from "@/types/db";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";

interface MemberDetailProps {
  member: FullMember;
}

export function MemberDetail({ member }: MemberDetailProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{member.name}</CardTitle>
        <CardDescription>View and manage member details</CardDescription>
        {/* Action Buttons */}
        <CardAction>
          <div className="flex gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={`/admin/members/${member.id}/edit`}>
                <Pencil />
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              className="hover:cursor-pointer"
              onClick={() => deleteMember(member.id)}
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
                  Team Name
                </dt>
                <dd className="text-sm">{member.team?.name ?? "-"}</dd>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
