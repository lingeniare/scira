import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : 'https://vega.chat',
  plugins: [magicLinkClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
