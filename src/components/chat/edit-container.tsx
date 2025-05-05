import Markdown from 'react-markdown';

import { ElementApi, TextApi } from '@udecode/plate';
import {
  type TResolvedSuggestion,
  type TSuggestionElement,
  acceptSuggestion,
  keyId2SuggestionId,
  rejectSuggestion,
} from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { PlateEditor, useEditorPlugin } from '@udecode/plate/react';
import { toast } from 'sonner';

import { Button } from '@/components/plate-ui/button';
import { EditBlock } from '@/utils/edit-utils';

// Define constants locally to avoid circular dependency
const BLOCK_SUGGESTION = '__block__';
// Simplified TYPE_TEXT_MAP - just include what we need or use a fallback approach
const TYPE_TEXT_MAP: Record<string, (node?: any) => string> = {
  default: () => 'Block',
  h1: () => 'Heading 1',
  h2: () => 'Heading 2',
  h3: () => 'Heading 3',
  p: () => 'Paragraph',
};

interface EditContainerProps {
  editor: PlateEditor;
  edits: EditBlock[];
  isLastMessage: boolean;
  isProcessingEdit: boolean;
  nonEditContent?: string;
}

interface MinimalResolvedSuggestion extends TResolvedSuggestion {
  keyId: string;
}

export const EditContainer = ({ 
  editor, 
  edits, 
  isLastMessage,
  isProcessingEdit,
  nonEditContent = ''
}: EditContainerProps) => {
  const { api } = useEditorPlugin(SuggestionPlugin)
  const hasEdits = edits.length > 0;

  const getAllResolvedSuggestions = (): MinimalResolvedSuggestion[] => {
    const suggestionNodes = api.suggestion.nodes({ at: [] });
  
    if (suggestionNodes.length === 0) return [];
  
    const suggestionIds = new Set<string>(
      suggestionNodes
        .map(([node]) => api.suggestion.nodeId(node))
        .filter((id): id is string => !!id)
    );
  
    const resolved: MinimalResolvedSuggestion[] = [];
  
    suggestionIds.forEach((keyId) => {
      const suggestionId = keyId2SuggestionId(keyId);
  
      const entries = suggestionNodes.filter(
        ([node]) => api.suggestion.nodeId(node) === keyId
      );
  
      if (entries.length === 0) return;
  
      let newText = '';
      let text = '';
      let properties: Record<string, any> = {};
      let newProperties: Record<string, any> = {};
  
      entries.forEach(([node]) => {
        if (TextApi.isText(node)) {
          const dataList = api.suggestion.dataList(node);
          dataList.forEach((data) => {
            if (data.id !== suggestionId) return;
  
            switch (data.type) {
              case 'insert':
                newText += node.text;
                break;
              case 'remove':
                text += node.text;
                break;
              case 'update':
                properties = { ...properties, ...data.properties };
                newProperties = { ...newProperties, ...data.newProperties };
                newText += node.text;
                break;
            }
          });
        } else if (ElementApi.isElement(node)) {
          const lineBreakData = api.suggestion.isBlockSuggestion(node as TSuggestionElement)
            ? (node as TSuggestionElement).suggestion
            : undefined;
  
          if (lineBreakData?.id !== suggestionId) return;
  
          const typeText = TYPE_TEXT_MAP[node.type]
            ? TYPE_TEXT_MAP[node.type](node)
            : TYPE_TEXT_MAP.default ? TYPE_TEXT_MAP.default(node) : 'Block';
          const suggestionMarker = lineBreakData.isLineBreak
            ? BLOCK_SUGGESTION
            : BLOCK_SUGGESTION + typeText;
  
          if (lineBreakData.type === 'insert') {
            newText += suggestionMarker;
          } else if (lineBreakData.type === 'remove') {
            text += suggestionMarker;
          }
        }
      });
  
      const nodeData = api.suggestion.suggestionData(entries[0][0]);
      if (!nodeData) return;
  
      const suggestionBase = {
        createdAt: new Date(nodeData.createdAt),
        keyId,
        suggestionId: suggestionId,
        userId: nodeData.userId,
      };
  
      if (nodeData.type === 'update') {
         resolved.push({
          ...suggestionBase,
          newProperties,
          newText,
          properties,
          type: 'update',
        });
      } else if (newText.length > 0 && text.length > 0) {
        resolved.push({
          ...suggestionBase,
          newText,
          text,
          type: 'replace',
        });
      } else if (newText.length > 0) {
        resolved.push({
          ...suggestionBase,
          newText,
          text: '',
          type: 'insert',
        });
      } else if (text.length > 0) {
         resolved.push({
          ...suggestionBase,
          newText: '',
          text,
          type: 'remove',
        });
      }
    });
  
    return resolved;
  };

  const handleAcceptAll = () => {
    if (!isLastMessage || !editor) return;

    const suggestions = getAllResolvedSuggestions();
    if (suggestions.length === 0) {
      toast.info("No active suggestions found in the editor to accept.");
      return;
    }

    try {
      api.suggestion.withoutSuggestions(() => {
        suggestions.forEach((suggestion) => {
          acceptSuggestion(editor, suggestion as TResolvedSuggestion);
        });
      });
      toast.success("All suggestions accepted.");
    } catch (error) {
      console.error("Error accepting all suggestions:", error);
      toast.error("An error occurred while accepting suggestions.");
    }
  };

  const handleRejectAll = () => {
    if (!isLastMessage || !editor) return;

    const suggestions = getAllResolvedSuggestions();
    if (suggestions.length === 0) {
      toast.info("No active suggestions found in the editor to reject.");
      return;
    }

    try {
      api.suggestion.withoutSuggestions(() => {
        suggestions.forEach((suggestion) => {
          rejectSuggestion(editor, suggestion as TResolvedSuggestion);
        });
      });
      toast.success("All suggestions rejected.");
    } catch (error) {
      console.error("Error rejecting all suggestions:", error);
      toast.error("An error occurred while rejecting suggestions.");
    }
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
    const hasActiveSuggestions = editor ? getAllResolvedSuggestions().length > 0 : false;

    return (
      <div className="space-y-2">
        {nonEditContent && <Markdown className="react-markdown text-sm whitespace-normal">{nonEditContent}</Markdown>}
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">
              {`${edits.length} edit${edits.length > 1 ? 's' : ''} suggested`}
            </span>
            {hasActiveSuggestions && (
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