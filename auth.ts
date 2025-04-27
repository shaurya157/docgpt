import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import 'next-auth/jwt';
import { updateUserLastLoginTimestamp } from '@/firebase/firestore-dao';

export const { auth, handlers, signIn, signOut } = NextAuth({
  basePath: '/api/auth',
  callbacks: {
    // authorized({ request, auth }) {
    //   const { pathname } = request.nextUrl
    //   if (pathname === "/middleware-example") return !!auth
    //   return true
    // },
    async signIn({ user, account, profile, email, credentials }) {
      if (user?.email) {
        try {
          await updateUserLastLoginTimestamp(user.email);
        } catch (error) {
          console.error('Failed to update user last login timestamp during sign in:', error);
          // Decide if sign-in should fail if timestamp update fails.
          // Returning false here would stop the sign-in process.
          // return false;
        }
      }
      return true; // Continue the sign-in process
    },
    jwt({ account, session, token, trigger }) {
      if (trigger === 'update') token.name = session.user.name;
      if (account?.provider === 'keycloak') {
        return { ...token, accessToken: account.access_token };
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) session.accessToken = token.accessToken;

      return session;
    },
  },
  debug: !!process.env.AUTH_DEBUG,
  experimental: { enableWebAuthn: true },
  // adapter: UnstorageAdapter(storage),
  providers: [Google],
  session: { strategy: 'jwt' },
  theme: { logo: 'https://authjs.dev/img/logo-sm.png' },
});

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}
