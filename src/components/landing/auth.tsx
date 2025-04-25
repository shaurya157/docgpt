'use client';

import { signIn } from 'next-auth/react';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/plate-ui/button';

interface SignInButtonProps {
    displayText: string;
}
export function SignIn({ displayText, provider, ...props}: { provider?: string } & React.ComponentPropsWithRef<typeof Button> & SignInButtonProps) {
  const router = useRouter();
  
  return (
    <Button 
      className="mr-4"
      onClick={() => router.push('/signin')}
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
      className="p-1.5 rounded-md hover:bg-gray-100"
      aria-label="Sign out"
      {...props}
      onClick={() => nextAuthSignOut({ callbackUrl: '/' })}
    >
      <LogOut className="w-5 h-5 text-gray-600" />
    </Button>
  );
}
