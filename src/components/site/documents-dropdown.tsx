'use client';

import * as React from 'react';
import { setActiveUserDoc } from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-context-provider';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Button } from '@/components/plate-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/plate-ui/dropdown-menu';

export function DocumentsDropdown() {
  const openState = useOpenState();
  const { userOwnedDocuments } = useUserDataContext();
  const { setActiveUserDocument } = useDocument();
  const { data: session } = useSession();
  const { threadId, setThreadId } = useUserDataContext();

  const setDoc = (doc) => {
    return () => {
      setActiveUserDocument(doc);
      setThreadId(doc['threadId']);
      setActiveUserDoc(session!.user!.email!, doc['documentName']);
      toast.info(
        `Setting document to ${doc['documentName']} and using thread ${doc['threadId']}`
      );
    };
  };

  const createDoc = async () => {
    const createThreadResult = await fetch('/api/ai/thread/create', {
      method: 'POST',
      body: JSON.stringify({ userId: session!.user!.email }),
    });
    const responseJson = await createThreadResult.json();
    setThreadId(responseJson['threadId']);
    setActiveUserDocument({
      document: [
        {
          type: 'h1',
          id: '1',
          children: [
            {
              text: 'Title',
            },
          ],
        },
      ],
      threadId: responseJson['threadId'],
      vectorStoreId: responseJson['vectorStoreId'],
    });
    // Create thread
    // Set doc state to nothing
    // set chat state to nothing
    toast.info(
      `Created a new thread with the same assistants. Thread: ${threadId} Please re-upload any document specific files.`
    );
  };

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <Button>Documents</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        {userOwnedDocuments?.map((doc, idx) => {
          return (
            <div
              key={`documentId-${doc}-${idx}`}
              className="flex flex-row items-center space-y-1 p-2"
            >
              <p className="w-64">{doc['documentName']}</p>
              <Button onClick={setDoc(doc)}>Use doc</Button>
            </div>
          );
        })}
        <Button onClick={createDoc}>Create a new document</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
