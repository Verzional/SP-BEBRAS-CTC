"use client";

import { signOut } from "next-auth/react";

export function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
