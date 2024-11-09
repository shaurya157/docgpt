import {auth} from "../../../auth";
import {SignIn, SignOut} from "@/components/site/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "../plate-ui/dropdown-menu";
import {Button} from "@/components/plate-ui/button";
import {Session} from "next-auth";

interface UserButtonProps {
    session?: Session | null
}

export default async function UserButton({session}: UserButtonProps) {
    if (!session?.user) return <SignIn/>
    return (
        <div className="flex items-center gap-2">
      <span className="hidden text-sm sm:inline-flex">
        {session.user.email}
      </span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {session.user.name}
                            </p>
                            <p className="text-muted-foreground text-xs leading-none">
                                {session.user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem>
                        <SignOut/>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
