'use client';

import { Button } from '@/components/plate-ui/button';
import { signIn } from 'next-auth/react';
import { signOut as nextAuthSignOut } from 'next-auth/react';

interface SignInButtonProps {
    displayText: string;
}
export function SignIn({ displayText, provider, ...props}: { provider?: string } & React.ComponentPropsWithRef<typeof Button> & SignInButtonProps) {
  return (
    <Button 
      className="mr-4"
      onClick={() => signIn('google', { callbackUrl: '/home' })}
      {...props}
    >
      {displayText}
    </Button>
  );
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <Button 
      variant="ghost" 
      className="w-full p-0" 
      {...props}
      onClick={() => nextAuthSignOut({ callbackUrl: '/' })}
    >
      Sign Out
    </Button>
  );
}
