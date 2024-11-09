import {auth} from "../../../auth";
import {SignIn, SignOut} from "@/components/site/auth";
import {useSession} from "next-auth/react";
import {Session} from "next-auth";

interface UploadedFilesProps {
  session?: Session | null | undefined,
  userFilesData: Array<Map<string, string>>
}

export function UploadedFiles({session, userFilesData}: UploadedFilesProps) {
  if (!session?.user) {
    return <div>Please sign in to view uploaded files</div>
  } else {
    return <div>
      {
        userFilesData.map((file: Map<string, string>) => {
          return <div key={file["openAiFileId"]}>
            {file["fileName"]}
          </div>
        })
      }
    </div>
  }
}
