import prisma from "@/lib/core/prisma";
import { Role } from "@/generated/client/enums";
import { hashSync } from "@node-rs/bcrypt";

const adminAccounts = [
  {
    name: "Valen",
    username: "valenAdmin",
    password: "valenAdmin123",
    role: Role.ADMIN,
  },
];

async function seedAccounts(userData: {
  name: string;
  username: string;
  password: string;
  role: Role;
}) {
  try {
    const hashedPassword = hashSync(userData.password, 10);

    await prisma.account.create({
      data: {
        username: userData.username,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
      },
    });

    console.log(`Created account: ${userData.name} (${userData.username})`);
  } catch (error) {
    console.error(`Failed to create account ${userData.username}:`, error);
  }
}

export async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("Seeding accounts...");
  console.log("=".repeat(50));

  for (const account of adminAccounts) {
    await seedAccounts(account);
  }
}

main()
  .then(async () => {
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
