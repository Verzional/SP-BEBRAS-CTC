import type { NextAuthConfig } from "next-auth";
import { ROLE_HOME_ROUTES } from "@/utils/auth";
import { isAdminOrMaster } from "@/utils/auth";

type UserRole = keyof typeof ROLE_HOME_ROUTES;

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const userRole = auth?.user?.role;

      const isPublicRoute = pathname === "/auth/login" || pathname === "/";

      if (isPublicRoute && isLoggedIn && userRole) {
        const homeRoute = ROLE_HOME_ROUTES[userRole as UserRole];
        if (homeRoute) {
          return Response.redirect(new URL(homeRoute, nextUrl));
        }
      }

      if (isPublicRoute) {
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (pathname.startsWith("/master")) {
        return userRole === "MASTER";
      }

      if (pathname.startsWith("/admin")) {
        return isAdminOrMaster(userRole);
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
