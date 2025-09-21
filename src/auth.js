/**
 * WARNING: This file connects this app to Create's internal auth system. Do
 * not attempt to edit it. Do not import @auth/create or @auth/create
 * anywhere else or it may break. This is an internal package.
 */
import CreateAuth from "@auth/create";
import Credentials from "@auth/core/providers/credentials";
import sql from "@/app/api/utils/sql";

export const { auth } = CreateAuth({
  providers: [
    Credentials({
      id: "credentials-signin",
      name: "credentials-signin",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Look up user by email
          const userResult = await sql`
            SELECT u.id, u.name, u.email, u.email_verified, a.password
            FROM auth_users u
            JOIN auth_accounts a ON u.id = a."userId"
            WHERE u.email = ${credentials.email.toLowerCase()}
            AND a.type = 'credentials'
            AND a.provider = 'credentials'
          `;

          if (userResult.length === 0) {
            throw new Error("Invalid email or password");
          }

          const user = userResult[0];

          // Check if account is activated
          if (!user.email_verified) {
            throw new Error(
              "Please activate your account by clicking the link in your email",
            );
          }

          // Verify password
          const bcrypt = require("bcrypt");
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          // Return user object
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            emailVerified: user.email_verified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
    Credentials({
      id: "credentials-signup",
      name: "credentials-signup",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        // Signup is handled by the /api/auth/register endpoint
        // This provider is just a placeholder for the signup flow
        throw new Error("Use registration API endpoint for signup");
      },
    }),
  ],
  pages: {
    signIn: "/account/signin",
    signOut: "/account/logout",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
});
