import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { customers as fallbackCustomers } from "@/data/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const db = await connectToDatabase();
        const email = (credentials.email as string).toLowerCase().trim();

        // Graceful database offline fallback
        if (!db || mongoose.connection.readyState !== 1) {
          console.warn("Database offline. Authenticating via local mock session fallback.");
          
          if (email === "admin@rajaboothouse.in" && credentials.password === "RajaBoots@2025") {
            return {
              id: "admin-mock-id",
              name: "Bipin Gupta (Mock)",
              email: "admin@rajaboothouse.in",
              role: "admin",
            };
          }

          const matchedMock = fallbackCustomers.find((c) => c.email === email);
          if (matchedMock) {
            return {
              id: matchedMock.id,
              name: matchedMock.name,
              email: matchedMock.email,
              role: matchedMock.role === "admin" ? "admin" : "customer",
            };
          }
          throw new Error("Database offline. Invalid credentials for mock sign in.");
        }
        
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("Please log in using Google");
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated");
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "customer";
      }

      if (account && account.provider === "google") {
        const db = await connectToDatabase();
        const email = token.email?.toLowerCase().trim();

        if (!db || mongoose.connection.readyState !== 1) {
          console.warn("Database offline. Google provider fallback.");
          token.id = "google-mock-id";
          token.role = "customer";
          return token;
        }

        // Dynamic lookup or registration for google OAuth users
        let dbUser = await User.findOne({ email });

        if (!dbUser) {
          dbUser = await User.create({
            name: token.name || "Google User",
            email,
            googleId: account.providerAccountId,
            role: "customer",
            isActive: true,
            isEmailVerified: true,
          });
        } else if (!dbUser.googleId) {
          // Link google account to existing email user
          dbUser.googleId = account.providerAccountId;
          dbUser.isEmailVerified = true;
          await dbUser.save();
        }

        token.id = dbUser._id.toString();
        token.role = dbUser.role || "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
