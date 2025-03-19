import { useCallback } from 'react';
import { deserializeMd } from '@udecode/plate-markdown';
import { PlateEditor } from '@udecode/plate/react';
import { updateDocumentTitle } from '@/firebase/firestore-dao';
import deserializeListMd, { classifyStart } from '@/utils/serialization-util';

interface UseDocumentIntegrationProps {
  editor: PlateEditor;
  documentId: string;
  changeEditorContent: (content: any) => void;
}

export const useDocumentIntegration = ({
  editor,
  documentId,
  changeEditorContent,
}: UseDocumentIntegrationProps) => {
  const updateEditorWithNewDocument = useCallback(
    (document: string, documentTitle: string) => {
      return async () => {
        let result: any[] = [];
        const doubleNewLineSplitArr = document.split('\n\n');
        
        doubleNewLineSplitArr.forEach((doubleLineSplitText) => {
          const singleNewLineSplit = doubleLineSplitText.split('\n');

          singleNewLineSplit.forEach((singleNewLineSplitText) => {
            const listStyleType = classifyStart(singleNewLineSplitText);
            if (listStyleType) {
              const deserializedList = deserializeListMd(
                singleNewLineSplitText,
                editor,
                listStyleType
              );

              result = result.concat(deserializedList);
            } else {
              const resNodes = deserializeMd(editor, singleNewLineSplitText);
              result = result.concat(resNodes[0]);
            }
          });
        });

        if (documentId) {
          const { error } = await updateDocumentTitle(documentId, documentTitle);
          if (error) {
            console.error(`Error saving title to db. Error: ${error}`);
          }
        }

        changeEditorContent(result);
      };
    },
    [editor, documentId, changeEditorContent]
  );

  return {
    updateEditorWithNewDocument,
  };
}; 