import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname === "/auth/login";
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (isAdminRoute && auth?.user?.role !== "ADMIN") {
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
