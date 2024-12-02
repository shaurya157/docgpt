'use client';

import * as React from "react";
import {TrashIcon, UploadIcon} from "@radix-ui/react-icons";
import {useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    useOpenState,
} from '../plate-ui/dropdown-menu';
import {useForm, SubmitHandler} from 'react-hook-form';
import {UploadedFiles} from "@/components/site/uploaded-files";
import {Session} from "next-auth";
import {useSession} from "next-auth/react";
import {useUserDataContext} from "@/providers/UserDataContextProvider";
import {appendFileDataToUser} from "@/firebase/firestore-dao";
import {Button} from "@/components/plate-ui/button";
import {Input} from "@/components/plate-ui/input";
import {toast} from "sonner";

export function FilesDropdownMenu() {
    const openState = useOpenState();
    const {data: session} = useSession()
    const { files, vectorStoreId } = useUserDataContext()
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm();

    const onSubmit = async (data) => {
        const formData = new FormData();
        const userEmail = session?.user?.email

      // TODO: Maybe we can use useEffect() here?
        if (userEmail != null || userEmail != undefined) {
          formData.append('file', data.file[0]);
          formData.append("user_id", userEmail!!);

          // @ts-ignore
          formData.append("vector_store_id", vectorStoreId);
          try {
            let response = await fetch('/api/ai/files', {
              method: 'POST',
              body: formData,
            })

            let responseJson = await response.json()
            console.log(`Saving ${responseJson.openAiFileId} to firebase`);
            // Firebase save of file ID
            const map = new Map<string, string>();
            map.set('openAiFileId', responseJson.openAiFileId);
            map.set('fileName', data.file[0]["name"]);

            await appendFileDataToUser(userEmail, map)
            toast.success("Success uploading file!")
          } catch (e) {
            toast.error("Something went wrong while uploading. Please refresh the page and try again.")
          }
        }

        reset()
    };

    return (
        <DropdownMenu modal={false} {...openState} >
            <DropdownMenuTrigger asChild>
                <Button>Context Documents</Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
                align="start"
            >
                <UploadedFiles session={session} userFilesData={files ? files : []}/>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input type="file" {...register("file")} multiple={true}/>
                    <Button>Submit</Button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
