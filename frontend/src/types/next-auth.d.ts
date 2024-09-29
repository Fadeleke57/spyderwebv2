import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      email: string;
      full_name: string;
    };
  }

  interface User {
    id: string;
    accessToken?: string;
    email: string;
    full_name: string;
    analytics?: {
      searches: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
