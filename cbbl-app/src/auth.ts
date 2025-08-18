import NextAuth, { type NextAuthConfig } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { mongoClientPromise } from "@/lib/mongodb";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";
import { ObjectId } from "mongodb";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig = {
  session: { strategy: "jwt" },
  adapter: MongoDBAdapter(await mongoClientPromise),
  providers: [
    // 🔑 Email & Password Sign-In
    Credentials({
      name: "Email & Password",
      async authorize(creds) {
        const parsed = CredentialsSchema.safeParse(creds);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const client = await mongoClientPromise;
        const db = client.db();
        const users = db.collection("users");

        // find user by email
        const user = await users.findOne<{
          _id: ObjectId;
          email: string;
          password?: string;
          role?: string;
        }>({ email });

        if (!user || !user.password) return null;

        // check password hash
        const ok = await compare(password, user.password);
        if (!ok) return null;

        return {
          id: String(user._id),
          email: user.email,
          role: user.role ?? "user",
        };
      },
    }),

    // 🔑 Google OAuth Sign-In
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role ?? "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

// v5 pattern: export handlers + helpers
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
