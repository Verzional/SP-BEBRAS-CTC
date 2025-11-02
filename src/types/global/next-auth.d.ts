import "next-auth";
import "next-auth/jwt";
import { Role } from "@/generated/client/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      name: string;
      role: Role;
      teamId?: string | null;
    };
  }

  interface User {
    username: string;
    name: string;
    role: Role;
    teamId?: string | null;
    activeSessionToken?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    name?: string;
    role?: Role;
    teamId?: string | null;
    activeSessionToken?: string | null;
    sessionCreatedAt?: number;
  }
}
