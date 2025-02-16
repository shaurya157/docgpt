import { Session } from 'next-auth';

import {SignIn, SignOut} from "@/components/landing/auth";
import { Button } from '@/components/plate-ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../plate-ui/dropdown-menu';

interface UserButtonProps {
  session?: Session | null;
}

export default async function SignInButton({ session }: UserButtonProps) {
  if (!session?.user) return <SignIn />;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative size-8 rounded-full">
            {/* <Avatar className="size-8"> */}
            {/*  <AvatarImage */}
            {/*    alt={session.user.name ?? ''} */}
            {/*    src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${Math.floor(Math.random() * 100000) + 1}&randomizeIds=true`} */}
            {/*  /> */}
            {/* </Avatar> */}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <SignOut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
