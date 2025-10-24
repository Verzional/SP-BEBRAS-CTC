import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [

  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname === "/auth/login";

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true; 
      }

      if (!isLoggedIn) {
        return false;
      }

      return true; 
    },
  },
} satisfies NextAuthConfig;
