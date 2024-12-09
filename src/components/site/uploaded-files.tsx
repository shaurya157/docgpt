import {Session} from "next-auth";
import {Trash2} from "lucide-react";
import {deleteUserUploadedFile} from "@/firebase/firestore-dao";
import {toast} from "sonner";

interface UploadedFilesProps {
  session?: Session | null | undefined,
  userFilesData: Array<Map<string, string>>
}

export function UploadedFiles({session, userFilesData}: UploadedFilesProps) {
  const handleDeleteFile =  (openAiFileId: string, fileName: string) => {
    return async () => {
      let response = await fetch('/api/ai/files', {
        method: "DELETE",
        body: JSON.stringify({ openAiFileId })
      })

      let responseJson = await response.json()
      console.log(responseJson)
      if (response.ok) {
        const res = await deleteUserUploadedFile(session!.user!.email!, fileName, openAiFileId)

        if (!res.error) {
          toast.success("Successfully deleted");
        } else {
          toast.error(`Error deleting file. Error: ${res.error.message}`);
        }
      } else {
        console.log(`Error deleting! Error: ${responseJson.message}`);
      }
    }
  }

  if (!session?.user) {
    return <div>Please sign in to view uploaded files</div>
  } else {
    return <div className="p-2 flex flex-row space-y-1 items-center">
      {
        userFilesData.map((file: Map<string, string>) => {
          return <div className={"relative flex"} key={file["openAiFileId"]}>
            <p className="w-64">{file["fileName"]}</p>
            <Trash2 className={"cursor-pointer"} onClick={handleDeleteFile(file["openAiFileId"], file["fileName"])}/>
          </div>
        })
      }
    </div>
  }
}
