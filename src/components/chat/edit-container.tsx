import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

import { MarkdownPlugin } from '@udecode/plate-markdown';
import { PlateEditor } from '@udecode/plate/react';
import { toast } from 'sonner';

import { Button } from '@/components/plate-ui/button';
import { EditBlock } from '@/utils/edit-parser';

interface EditContainerProps {
  editor: PlateEditor;
  edits: EditBlock[];
  isLastMessage: boolean;
  isProcessingEdit: boolean;
  nonEditContent?: string;
}

type EditStatus = 'accepted' | 'pending' | 'rejected';

export const EditContainer = ({ 
  editor, 
  edits, 
  isLastMessage,
  isProcessingEdit,
  nonEditContent = ''
}: EditContainerProps) => {
  const [editStatuses, setEditStatuses] = useState<{ [key: number]: EditStatus }>({});
  const [isEditExpanded, setIsEditExpanded] = useState<{ [key: number]: boolean }>({});
  
  const hasEdits = edits.length > 0;

  // Initialize/clear statuses based on edits
  useEffect(() => {
    if (hasEdits) {
      const newStatuses: { [key: number]: EditStatus } = {};
      let changed = false;

      // Initialize statuses for current edits
      edits.forEach((_, index) => {
        const currentStatus = editStatuses[index];
        if (currentStatus) {
          newStatuses[index] = currentStatus;
        } else {
          newStatuses[index] = 'pending';
          changed = true;
        }
      });

      // Clean up statuses for removed edits
      const currentKeysLength = Object.keys(editStatuses).length;
      Object.keys(newStatuses).forEach(keyStr => {
        const keyIndex = parseInt(keyStr, 10);
        if (keyIndex >= edits.length) {
          delete newStatuses[keyIndex];
          changed = true;
        }
      });
      const finalKeysLength = Object.keys(newStatuses).length;

      if (changed || currentKeysLength !== finalKeysLength) {
        setEditStatuses(newStatuses);
      }
    } else if (Object.keys(editStatuses).length > 0) {
      setEditStatuses({});
    }
  }, [edits, hasEdits, editStatuses]);

  // Initialize/reset edit expansion state
  useEffect(() => {
    if (hasEdits) {
      const newExpansionStates: { [key: number]: boolean } = {};
      let changed = false;

      // Initialize expansion states for current edits
      edits.forEach((_, index) => {
        const currentExpansion = isEditExpanded[index];
        if (currentExpansion !== undefined) {
          newExpansionStates[index] = currentExpansion;
        } else {
          newExpansionStates[index] = false;
          changed = true;
        }
      });

      // Clean up expansion states for removed edits
      const currentKeysLength = Object.keys(isEditExpanded).length;
      Object.keys(newExpansionStates).forEach(keyStr => {
        const keyIndex = parseInt(keyStr, 10);
        if (keyIndex >= edits.length) {
          delete newExpansionStates[keyIndex];
          changed = true;
        }
      });
      const finalKeysLength = Object.keys(newExpansionStates).length;

      if (changed || currentKeysLength !== finalKeysLength) {
        setIsEditExpanded(newExpansionStates);
      }
    } else if (Object.keys(isEditExpanded).length > 0) {
      setIsEditExpanded({});
    }
  }, [edits, hasEdits, isEditExpanded]);

  // Attempts to apply a single edit block to the editor's current content
  const applySingleEdit = (edit: EditBlock): boolean => {
    let editorMarkdown = editor.getApi(MarkdownPlugin).markdown.serialize();

    if (editorMarkdown.includes(edit.original)) {
      editorMarkdown = editorMarkdown.replace(edit.original, edit.newText);
      const deserializedNodes = editor.getApi(MarkdownPlugin).markdown.deserialize(editorMarkdown);
      editor.tf.setValue(deserializedNodes);
      return true;
    } else {
      console.warn("Edit could not be applied: Original content not found.", edit);
      return false;
    }
  };

  const handleAcceptAll = () => {
    if (!isLastMessage) return;

    let currentEditorMarkdown = editor.getApi(MarkdownPlugin).markdown.serialize();
    const updatedStatuses = { ...editStatuses };
    const successfullyAppliedIndices: number[] = [];
    const failedEditIndices: number[] = [];
    let markdownChanged = false;

    edits.forEach((edit, index) => {
      if (updatedStatuses[index] === 'pending') {
        if (currentEditorMarkdown.includes(edit.original)) {
          currentEditorMarkdown = currentEditorMarkdown.replace(edit.original, edit.newText);
          updatedStatuses[index] = 'accepted';
          successfullyAppliedIndices.push(index + 1);
          markdownChanged = true;
        } else {
          failedEditIndices.push(index + 1);
          console.warn(`Accept All: Edit ${index + 1} original content not found.`);
        }
      }
    });

    if (markdownChanged) {
      const deserializedNodes = editor.getApi(MarkdownPlugin).markdown.deserialize(currentEditorMarkdown);
      editor.tf.setValue(deserializedNodes);
    }

    setEditStatuses(updatedStatuses);

    if (failedEditIndices.length > 0) {
      toast.error(`Edits ${failedEditIndices.join(', ')} could not be applied: Original content has changed.`);
    } else if (successfullyAppliedIndices.length > 0) {
      toast.success("Selected edits applied successfully.");
    } else {
      toast.info("No pending edits were applicable.");
    }
  };

  const handleRejectAll = () => {
    if (!isLastMessage) return;
    const newStatuses: { [key: number]: EditStatus } = {};
    edits.forEach((_, index) => {
      newStatuses[index] = 'rejected';
    });
    setEditStatuses(newStatuses);
  };

  // Processing edits
  if (isProcessingEdit) {
    return (
      <div className="space-y-2">
        {nonEditContent && <Markdown className="react-markdown text-sm whitespace-normal">{nonEditContent}</Markdown>}
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">Generating edits...</span>
          </div>
        </div>
      </div>
    );
  }

  // Finished processing, has edits
  if (hasEdits) {
    return (
      <div className="space-y-2">
        {nonEditContent && <Markdown className="react-markdown text-sm whitespace-normal">{nonEditContent}</Markdown>}
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">
              {`${edits.length} edit${edits.length > 1 ? 's' : ''} suggested`}
            </span>
            {Object.values(editStatuses).some(status => status === 'pending') && (
              <div className="flex gap-1">
                <Button size="xs" variant="outline" className="text-xs h-6 px-2" disabled={!isLastMessage} onClick={handleAcceptAll}>Accept All</Button>
                <Button size="xs" variant="outline" className="text-xs h-6 px-2" disabled={!isLastMessage} onClick={handleRejectAll}>Reject All</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}; 