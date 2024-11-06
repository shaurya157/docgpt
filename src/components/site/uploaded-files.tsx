import {auth} from "../../../auth";
import {SignIn, SignOut} from "@/components/site/auth";
import {useSession} from "next-auth/react";
import {Session} from "next-auth";

interface UploadedFilesProps {
  session?: Session | null | undefined
}

export function UploadedFiles({session}: UploadedFilesProps) {

  if (!session?.user) {
    return <div>Please sign in to view uploaded files</div>
  } else {
    return <div>File display is in progress,stay tuned!<br /></div>
  }
}
