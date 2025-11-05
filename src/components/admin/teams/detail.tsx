"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash } from "lucide-react";

import { deleteTeam } from "@/services/team";
import { FullTeam } from "@/types/db/team";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";

interface TeamDetailProps {
  team: FullTeam;
}

export function TeamDetail({ team }: TeamDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTeam(team.id);
      router.push("/admin/teams");
    } catch (error) {
      console.error("Failed to delete team:", error);
      toast.error("Failed to delete team");
    }
  };

  return (
    <>
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
                onClick={() => setShowDeleteDialog(true)}
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
                <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                  <dt className="text-muted-foreground text-sm font-medium">
                    Level
                  </dt>
                  <dd className="text-sm">{team.level}</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                  <dt className="text-muted-foreground text-sm font-medium">
                    Score
                  </dt>
                  <dd className="text-sm">{team.score}</dd>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold leading-none">
                Team Members ({team.members.length})
              </h3>
              {team.members.length > 0 ? (
                <div className="grid gap-3">
                  {team.members.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No members found.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Team"
        description={`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
