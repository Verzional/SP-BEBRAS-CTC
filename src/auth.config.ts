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
      const isMasterRoute = nextUrl.pathname.startsWith("/master");

      if (isAuthRoute) {
        if (isLoggedIn && auth?.user?.role === "USER") {
          return Response.redirect(new URL("/", nextUrl));
        } else if (isLoggedIn && auth?.user?.role === "ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }

        return true;
      }

      if (isAdminRoute) {
        if (isLoggedIn || auth?.user?.role !== "ADMIN") {
          return true;
        } else {
          return false;
        }
      }

      if (isMasterRoute) {
        if (isLoggedIn && auth?.user?.role === "MASTER") {
          return true;
        }
        return false;
      }

      if (!isLoggedIn) {
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
