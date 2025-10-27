"use client";

import Link from "next/link";
import { Pencil, Trash } from "lucide-react";

import { deleteSchool } from "@/services/school";
import { School } from "@/generated/client/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";

interface SchoolDetailProps {
  school: School;
}

export function SchoolDetail({ school }: SchoolDetailProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{school.name}</CardTitle>
        <CardDescription>View and manage school details</CardDescription>
        {/* Action Buttons */}
        <CardAction>
          <div className="flex gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={`/admin/schools/${school.id}/edit`}>
                <Pencil />
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"    
              className="hover:cursor-pointer"
              onClick={() => deleteSchool(school.id)}
            >
              <Trash />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold leading-none">
              Basic Information
            </h3>
            <dl className="divide-y">
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  School Name
                </dt>
                <dd className="text-sm">{school.name}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Address
                </dt>
                <dd className="text-sm">{school.address ?? "-"}</dd>
              </div>
            </dl>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold leading-none">
              Contact Information
            </h3>
            <dl className="divide-y">
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  PIC Name
                </dt>
                <dd className="text-sm">{school.picName ?? "-"}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  PIC Email
                </dt>
                <dd className="text-sm">{school.picEmail ?? "-"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
