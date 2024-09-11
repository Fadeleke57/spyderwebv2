import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { environment } from "@/environment/load_env";

export default NextAuth({
  providers: [
    // google OAuth provider
    GoogleProvider({
      clientId: environment.google_client_id as string,
      clientSecret: environment.google_client_secret as string,
    }),

    // regular auth
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${environment.api_url}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const user = await res.json();

        if (res.ok && user) {
          return user;
        } else {
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: environment.next_auth_secret,
});
