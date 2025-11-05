"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash } from "lucide-react";

import { deleteAccount } from "@/services/account";
import { Account } from "@/generated/client/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";

interface AccountDetailProps {
  account: Account & {
    team?: {
      id: string;
      name: string;
      school?: {
        id: string;
        name: string;
      } | null;
    } | null;
  };
}

export function AccountDetail({ account }: AccountDetailProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{account.name}</CardTitle>
        <CardDescription>View and manage account details</CardDescription>
        {/* Action Buttons */}
        <CardAction>
          <div className="flex gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={`/admin/accounts/${account.id}/edit`}>
                <Pencil />
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              className="hover:cursor-pointer"
              onClick={() => {
                deleteAccount(account.id);
                router.push("/admin/accounts");
              }}
            >
              <Trash />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold leading-none">
              Account Information
            </h3>
            <div className="divide-y">
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Username
                </dt>
                <dd className="text-sm">{account.username}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Name
                </dt>
                <dd className="text-sm">{account.name}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Role
                </dt>
                <dd className="text-sm">{account.role}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Team
                </dt>
                <dd className="text-sm">{account.team?.name ?? "-"}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  School
                </dt>
                <dd className="text-sm">{account.team?.school?.name ?? "-"}</dd>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
