'use client';

import * as React from 'react';
import { appendFileDataToUser } from '@/firebase/firestore-dao';
import { useUserDataContext } from '@/providers/user-data-context-provider';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/plate-ui/button';
import { Input } from '@/components/plate-ui/input';
import { UploadedFiles } from '@/components/site/uploaded-files';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState,
} from '../plate-ui/dropdown-menu';

export function FilesDropdownMenu() {
  const openState = useOpenState();
  const { data: session } = useSession();
  const { files, vectorStoreId } = useUserDataContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const formData = new FormData();
    const userEmail = session?.user?.email;

    // TODO: Maybe we can use useEffect() here?
    if (userEmail != null || userEmail != undefined) {
      formData.append('file', data.file[0]);
      formData.append('userId', userEmail!!);

      // @ts-ignore
      formData.append('vectorStoreId', vectorStoreId);
      try {
        let response = await fetch('/api/ai/files', {
          method: 'POST',
          body: formData,
        });

        let responseJson = await response.json();
        console.log(`Saving ${responseJson.openAiFileId} to firebase`);
        // Firebase save of file ID
        const map = new Map<string, string>();
        map.set('openAiFileId', responseJson.openAiFileId);
        map.set('fileName', data.file[0]['name']);

        await appendFileDataToUser(userEmail, map);
        toast.success('Success uploading file!');
      } catch (e) {
        toast.error(
          'Something went wrong while uploading. Please refresh the page and try again.'
        );
      }
    }

    reset();
  };

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <Button>Context Documents</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        <UploadedFiles session={session} userFilesData={files ? files : []} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input type="file" {...register('file')} multiple={true} />
          <Button>Submit</Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
