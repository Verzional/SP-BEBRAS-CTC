import "next-auth";
import "next-auth/jwt";
import { Role } from "@/generated/client/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: Role;
    };
  }

  interface User {
    username: string;
    role: Role;
    activeSessionToken?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: Role;
    activeSessionToken?: string | null;
    sessionCreatedAt?: number;
  }
}
