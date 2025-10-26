import { auth } from "@/auth";
import { Role } from "@/generated/client/enums";

export async function checkAdmin(): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  return session.user.role === Role.ADMIN;
}
