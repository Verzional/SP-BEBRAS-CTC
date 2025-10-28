"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashSync } from "@node-rs/bcrypt";
import { AccountFormData, AccountSchema } from "@/types/db";

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

  try {
    const existingAccount = await prisma.account.findUnique({
      where: { username: result.data.username },
    });

    if (existingAccount) {
      return {
        error: "Username already exists. Please choose another one.",
      };
    }

    const hashedPassword = hashSync(result.data.password, 10);

    const account = await prisma.account.create({
      data: {
        username: result.data.username,
        name: result.data.name,
        password: hashedPassword,
        role: result.data.role,
      },
    });

    revalidatePath("/admin/accounts");

    return { success: true, account };
  } catch (err) {
    return { error: "Failed to create account: " + (err as Error).message };
  }
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
  try {
    const deleted = await prisma.account.delete({
      where: { id: accountId },
    });

    revalidatePath("/admin/accounts");

    return { success: true, deleted };
  } catch (err) {
    console.error("Failed to delete account:", err);
    return { success: false, error: "Failed to delete account." };
  }
}
