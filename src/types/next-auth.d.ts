import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "customer" | "admin" | "vendor";
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: "customer" | "admin" | "vendor";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "customer" | "admin" | "vendor";
  }
}

