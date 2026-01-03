import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getCounselorByEmail, updateCounselorLastLogin } from "./db";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    name_en: string;
    role: "admin" | "counselor";
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      name_en: string;
      role: "admin" | "counselor";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    name_en: string;
    role: "admin" | "counselor";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const counselor = await getCounselorByEmail(credentials.email);
        if (!counselor) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, counselor.password);
        if (!isValid) {
          return null;
        }

        // Update last login
        await updateCounselorLastLogin(counselor.id);

        return {
          id: counselor.id,
          email: counselor.email,
          name: counselor.name,
          name_en: counselor.name_en,
          role: counselor.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.name_en = user.name_en;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        name_en: token.name_en,
        role: token.role,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
