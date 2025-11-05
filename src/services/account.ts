"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashSync } from "@node-rs/bcrypt";
import { AccountFormData, AccountSchema } from "@/types/db/account";

export async function getAllAccounts() {
  return await prisma.account.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createAccount(data: AccountFormData) {
  const result = AccountSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid account data submitted");
  }

  const existingAccount = await prisma.account.findUnique({
    where: { username: result.data.username },
  });

  if (existingAccount) {
    throw new Error("Username already exists. Please choose another one.");
  }

  const account = await prisma.account.create({
    data: {
      username: result.data.username,
      name: result.data.name,
      password: hashSync(result.data.password, 10),
      role: result.data.role,
      teamId: result.data.teamId,
    },
  });

  revalidatePath("/admin/accounts");

  return account;
}

export async function updateAccount(
  accountId: string,
  data: Partial<AccountFormData>
) {
  try {
    const updateData: Record<string, string> = {
      ...data,
    };

    if (data.password) {
      updateData.password = hashSync(data.password, 10);
    }

    const account = await prisma.account.update({
      where: { id: accountId },
      data: updateData,
    });

    revalidatePath("/admin/accounts");

    return account;
  } catch (err) {
    throw new Error("Failed to update account: " + (err as Error).message);
  }
}

export async function deleteAccount(accountId: string) {
  const deleted = await prisma.account.delete({
    where: { id: accountId },
  });

  revalidatePath("/admin/accounts");

  return deleted;
}

export async function getAccountById(accountId: string) {
  return await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      team: {
        include: {
          school: true,
        },
      },
    },
  });
}
