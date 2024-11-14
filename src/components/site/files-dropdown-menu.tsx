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

export function FilesDropdownMenu() {
    const openState = useOpenState();
    const {data: session} = useSession()
    const { fileIds, vectorStoreId } = useUserDataContext()
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
            await fetch('/api/files', {
                method: 'POST',
                body: formData,
            }).then(response => response.json())
                .then(responseJson => console.log(responseJson)); // TODO: need to use setState to set the userFileDatas
        } else {
            console.log("ERROR, user must be signed in to upload!")
        }

        reset()
    };

    return (
        <DropdownMenu modal={false} {...openState} >
            <DropdownMenuTrigger asChild>
                <UploadIcon/>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
                align="start"
            >
                <UploadedFiles session={session} userFilesData={fileIds ? fileIds : []}/>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input type="file" {...register("file")} multiple={true}/>
                    <button>Submit</button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
