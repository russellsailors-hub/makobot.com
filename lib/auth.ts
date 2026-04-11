import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { findOrCreateUser, getUserByEmail } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile, account }) {
      if (!profile?.email) return false;

      const provider = account?.provider || "google";

      // Use provider-specific ID as the google_id field (it's really just "oauth_id")
      const oauthId =
        provider === "github"
          ? `github-${profile.id || profile.sub}`
          : (profile.sub as string);

      // GitHub avatar is profile.avatar_url, Google is profile.picture
      const avatarUrl =
        (profile.avatar_url as string) ||
        (profile.picture as string) ||
        "";

      // GitHub login (username)
      const githubUsername =
        provider === "github" ? (profile.login as string) || undefined : undefined;

      await findOrCreateUser({
        google_id: oauthId,
        email: profile.email,
        name: (profile.name as string) || (profile.login as string) || "",
        avatar_url: avatarUrl,
        github_username: githubUsername,
      });

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await getUserByEmail(session.user.email);
        if (dbUser) {
          session.user.id = String(dbUser.id);
          session.user.isAdmin = dbUser.is_admin as boolean;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/get-key",
  },
});
