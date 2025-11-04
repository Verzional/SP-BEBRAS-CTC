import prisma from "@/lib/prisma";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { verify } from "@node-rs/bcrypt";
import { createId } from "@paralleldrive/cuid2";

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
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const account = await prisma.account.findUnique({
            where: { username: credentials.username as string },
          });

          if (!account || !account.password) {
            console.warn(
              `Auth attempt: User not found (${credentials.username})`
            );
            return null;
          }

          const isPasswordValid = await verify(
            credentials.password as string,
            account.password
          );

          if (!isPasswordValid) {
            console.warn(
              `Auth attempt: Invalid password for ${credentials.username}`
            );
            return null;
          }

          return {
            id: account.id,
            username: account.username,
            name: account.name,
            role: account.role,
            teamId: account.teamId,
          };
        } catch (error) {
          console.error("CRITICAL AUTHORIZE ERROR:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  events: {
    async signOut(message) {
      try {
        if ("token" in message && message.token?.id) {
          await prisma.account.update({
            where: { id: message.token.id as string },
            data: { sessionToken: null },
          });
        }
      } catch (error) {
        console.error("SignOut Event Error:", error);
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }) {
      try {
        if (user) {
          const sessionToken = createId();

          await prisma.account.update({
            where: { id: user.id },
            data: { sessionToken: sessionToken },
          });

          token.id = user.id;
          token.username = user.username;
          token.role = user.role;
          token.teamId = user.teamId;
          token.activeSessionToken = sessionToken;

          return token;
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
            return null;
          }
        } else {
          return null;
        }

        return token;
      } catch (error) {
        console.error("JWT Callback Error:", error);
        return null;
      }
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role!;
        session.user.teamId = token.teamId as string | null;
      }
      return session;
    },
  },
});
