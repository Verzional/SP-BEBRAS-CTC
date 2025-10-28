"use client";

import { useRouter } from "next/navigation";

import { Account } from "@/generated/client/client";
import { roleColors } from "@/utils/role";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AccountListProps {
  accounts: Account[];
}

export function AccountList({ accounts = [] }: AccountListProps) {
  const router = useRouter();

  return (
    <Table>
      <TableCaption>A list of accounts in the database.</TableCaption>
      {/* Table Header */}
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Team ID</TableHead>
        </TableRow>
      </TableHeader>
      {/* Table Body */}
      <TableBody>
        {accounts.map((account, index) => (
          <TableRow
            key={account.id}
            onClick={() => router.push(`/admin/accounts/${account.id}`)}
            className="cursor-pointer"
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium">{account.username}</TableCell>
            <TableCell>{account.name}</TableCell>
            <TableCell>
              <Badge className={roleColors[account.role]}>{account.role}</Badge>
            </TableCell>
            <TableCell className="font-mono text-sm text-muted-foreground">
              {account.teamId ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
