import deserializeListMd from '@/utils/serialization-util';
import { withAIBatch } from '@udecode/plate-ai';
import {
  AIChatPluginConfig,
  AIPluginConfig,
  useChatChunk,
} from '@udecode/plate-ai/react';
import { getBlockAbove } from '@udecode/plate-common';
import { useEditorPlugin } from '@udecode/plate-common/react';
import { deserializeInlineMd, deserializeMd } from '@udecode/plate-markdown';

export const useCustomAIChatHooks = () => {
  const { editor, tf } = useEditorPlugin<AIPluginConfig>({ key: 'ai' });
  const { useOption } = useEditorPlugin<AIChatPluginConfig>({ key: 'aiChat' });
  const mode = useOption('mode');

  useChatChunk({
    onChunk: ({ isFirst, nodes }) => {
      console.log('CHAT CHUNK', nodes);
      if (mode === 'insert' && nodes.length > 0) {
        withAIBatch(
          editor,
          () => {
            let nodesText = nodes[0].text;

            let doubleNewLineSplitArr = nodesText.split('\n\n');

            doubleNewLineSplitArr.forEach((doubleLineSplitText) => {
              let singleNewLineSplit = doubleLineSplitText.split('\n');

              singleNewLineSplit.forEach((singleNewLineSplitText) => {
                const listStyleType = classifyStart(singleNewLineSplitText);
                if (listStyleType) {
                  const deserializedList = deserializeListMd(
                    singleNewLineSplitText,
                    editor,
                    listStyleType
                  );
                  tf.ai.insertNodes(deserializedList);
                } else {
                  tf.ai.insertNodes(
                    deserializeMd(editor, singleNewLineSplitText)
                  );
                }
              });
            });
          }
          // { split: isFirst }
        );
      }
    },
    onFinish: ({ content }) => {
      // This hook is run via the streamText api by vercel, currently it does nothing. Streaming is only supported via chat and not via assistants.
      // Vercel also doesn't support streaming.

      console.log('FINISHED PROCESSING AI STUFF. More info:');
      console.log('Content: ', content);
      console.log('Mode: ', mode);
      if (mode !== 'insert') return;

      const blockAbove = getBlockAbove(editor);

      if (!blockAbove) return;

      // editor.undo();
      editor.history.redos.pop();

      const nodes = deserializeInlineMd(editor, content);

      withAIBatch(
        editor,
        () => {
          // TODO: when we want to eventually move to comments, to remove ai previews, comment out below
          tf.ai.insertNodes(nodes);
        },
        { split: true }
      );
    },
  });
};

function classifyStart(input: string): 'disc' | 'decimal' | null {
  // Regex to match '- ' or a digit followed by '.'
  const regex = /^\s*(-\s|\d+\.)/;

  const match = input.match(regex);
  if (!match) {
    return null;
  }

  // Check the matched group
  if (match[1].startsWith('-')) {
    return 'disc';
  } else if (/\d+\./.test(match[1])) {
    return 'decimal';
  }

  return null;
}
