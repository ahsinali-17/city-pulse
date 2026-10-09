import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "citizen@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Fetch user from Neon database
        const userArray = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string));

        const user = userArray[0];

        if (!user) {
          return null;
        }

        // If user has a hashed password (sign-up users), verify with bcrypt
        if (user.passwordHash) {
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!isValid) return null;
        }
        // Legacy seeded users without passwordHash: accept any password for dev convenience

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role and id to JWT on initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass role and id from JWT to the client session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

