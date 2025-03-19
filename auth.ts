import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import 'next-auth/jwt';

export const { auth, handlers, signIn, signOut } = NextAuth({
  basePath: '/api/auth',
  callbacks: {
    // authorized({ request, auth }) {
    //   const { pathname } = request.nextUrl
    //   if (pathname === "/middleware-example") return !!auth
    //   return true
    // },
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
