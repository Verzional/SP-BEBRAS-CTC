import prisma from "@/lib/core/prisma";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { verifySync } from "@node-rs/bcrypt";
import { createId } from "@paralleldrive/cuid2";

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        const account = await prisma.account.findUnique({
          where: { username: credentials.username as string },
        });
        if (!account) {
          throw new Error("Account not found");
        }
        if (!account.password) {
          throw new Error("No password set for this account");
        }
        const isPasswordValid = verifySync(
          credentials.password as string,
          account.password
        );
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
        const sessionToken = createId();
        const updatedAccount = await prisma.account.update({
          where: { id: account.id },
          data: { sessionToken: sessionToken },
        });
        if (!updatedAccount) {
          throw new Error("Failed to update account session");
        }
        return {
          id: updatedAccount.id,
          username: updatedAccount.username,
          role: updatedAccount.role,
          activeSessionToken: updatedAccount.sessionToken,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.id) {
        await prisma.account.update({
          where: { id: message.token.id as string },
          data: { sessionToken: null },
        });
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,

    async redirect({ baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.activeSessionToken = user.activeSessionToken;
        token.sessionCreatedAt = Date.now();
      } else {
        if (
          token.sessionCreatedAt &&
          Date.now() - (token.sessionCreatedAt as number) > SESSION_TIMEOUT
        ) {
          throw new Error("Session expired due to inactivity");
        }
        if (token.id && token.activeSessionToken) {
          const currentAccount = await prisma.account.findUnique({
            where: { id: token.id as string },
            select: { sessionToken: true },
          });
          if (
            !currentAccount ||
            currentAccount.sessionToken !== token.activeSessionToken
          ) {
            throw new Error(
              "Session invalidated - logged in from another device"
            );
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role!;
      }
      return session;
    },
  },
});
