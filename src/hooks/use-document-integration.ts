import { useCallback } from 'react';

import { deserializeMd, MarkdownPlugin } from '@udecode/plate-markdown';
import { PlateEditor } from '@udecode/plate/react';

import { updateDocumentTitle } from '@/firebase/firestore-dao';
import deserializeListMd, { classifyStart } from '@/utils/serialization-util';

interface UseDocumentIntegrationProps {
  documentId: string;
  editor: PlateEditor;
  changeEditorContent: (content: any) => void;
}

export const useDocumentIntegration = ({
  changeEditorContent,
  documentId,
  editor,
}: UseDocumentIntegrationProps) => {
  const updateEditorWithNewDocument = useCallback(
    (document: string, documentTitle: string) => {
      return async () => {
        let deserializedDocument = editor.getApi(MarkdownPlugin).markdown.deserialize(document);

        if (documentId) {
          const { error } = await updateDocumentTitle(documentId, documentTitle);
          if (error) {
            console.error(`Error saving title to db. Error: ${error}`);
          }
        }

        changeEditorContent(deserializedDocument);
      };
    },
    [editor, documentId, changeEditorContent]
  );

  return {
    updateEditorWithNewDocument,
  };
}; 