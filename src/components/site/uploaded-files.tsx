import {auth} from "../../../auth";
import {SignIn, SignOut} from "@/components/site/auth";
import {useSession} from "next-auth/react";

export async function UploadedFiles() {
  const {data: session} = useSession()
  if (!session?.user) {
    return <SignOut />
  } else {
    return (
      <div>
        Test
      </div>
    )
  }
}
