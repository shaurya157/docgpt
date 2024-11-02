import { getBlockAbove } from '@udecode/plate-common';
import { useEditorPlugin } from '@udecode/plate-common/react';
import { deserializeInlineMd } from '@udecode/plate-markdown';
import {AIChatPluginConfig, AIPluginConfig, useChatChunk} from "@udecode/plate-ai/react";
import {withAIBatch} from "@udecode/plate-ai";

export const useCustomAIChatHooks = () => {
  const { editor, tf } = useEditorPlugin<AIPluginConfig>({ key: 'ai' });
  const { useOption } = useEditorPlugin<AIChatPluginConfig>({ key: 'aiChat' });
  const mode = useOption('mode');

  useChatChunk({
    onChunk: ({ isFirst, nodes }) => {
      console.log("PROCESSING AI CHAT CHUNK. MORE INFO:")
      console.log("isFirst", isFirst);
      console.log("mode", mode);
      if (mode === 'insert' && nodes.length > 0) {
        withAIBatch(
          editor,
          () => {
            tf.ai.insertNodes(nodes);
          },
          { split: isFirst }
        );
      }
    },
    onFinish: ({ content }) => {
      console.log("FINISHED PROCESSING AI STUFF. More info:")
      console.log("Content: ", content);
      console.log("Mode: ", mode);
      if (mode !== 'insert') return;

      const blockAbove = getBlockAbove(editor);

      if (!blockAbove) return;

      // editor.undo();
      editor.history.redos.pop();

      const nodes = deserializeInlineMd(editor, content);

      withAIBatch(
        editor,
        () => {
          tf.ai.insertNodes(nodes);
        },
        { split: true }
      );
    },
  });
};
