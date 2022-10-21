import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubAuthProvider from "next-auth/providers/github";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubAuthProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      async profile(profile) {
        // find out the user
        await dbConnect();
        const oldUser = await User.findOne({ email: profile.email });
        const userProfile = {
          email: profile.email,
          name: profile.name || profile.login,
          avatar: profile.avatar_url,
          role: "user",
        };

        // store new user inside db
        if (!oldUser) {
          const newUser = new User({
            ...userProfile,
            provider: "github",
          });

          await newUser.save();
        } else {
          userProfile.role = oldUser.role;
        }
        return { id: profile.id, ...userProfile };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session }) {
      await dbConnect();
      const user = await User.findOne({ email: session.user?.email });
      if (user)
        session.user = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        } as any;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/404",
  },
};

export default NextAuth(authOptions);
