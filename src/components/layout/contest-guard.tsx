"use client";

import { useContestGuard } from "@/hooks/guard";

export function ContestGuard() {
  useContestGuard();

  return null;
}
