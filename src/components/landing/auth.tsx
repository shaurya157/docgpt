import { Button } from '@/components/plate-ui/button';

import { signIn, signOut } from '../../../auth';

interface SignInButtonProps {
    displayText: string;
}
export function SignIn({ displayText, provider, ...props}: { provider?: string } & React.ComponentPropsWithRef<typeof Button> & SignInButtonProps) {
  return (
    <form
      className="mr-4"
      action={async () => {
        'use server';
        await signIn('google', { redirectTo: '/home' });
      }}
    >
      <Button {...props}>{displayText}</Button>
    </form>
  );
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      className="w-full"
      action={async () => {
        'use server';
        await signOut();
      }}
    >
      <Button variant="ghost" className="w-full p-0" {...props}>
        Sign Out
      </Button>
    </form>
  );
}
