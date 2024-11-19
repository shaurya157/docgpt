import {getBlockAbove, TText} from '@udecode/plate-common';
import { useEditorPlugin } from '@udecode/plate-common/react';
import {deserializeInlineMd, deserializeMd} from '@udecode/plate-markdown';
import {AIChatPluginConfig, AIPluginConfig, useChatChunk} from "@udecode/plate-ai/react";
import {withAIBatch} from "@udecode/plate-ai";
import {Transforms} from "slate";
import {HEADING_KEYS} from "@udecode/plate-heading";

export const useCustomAIChatHooks = () => {
  const { editor, tf } = useEditorPlugin<AIPluginConfig>({ key: 'ai' });
  const { useOption } = useEditorPlugin<AIChatPluginConfig>({ key: 'aiChat' });
  const mode = useOption('mode');

  useChatChunk({
    onChunk: ({ isFirst, nodes }) => {
      if (mode === 'insert' && nodes.length > 0) {
        withAIBatch(
          editor,
          () => {
            let nodesText = nodes[0].text
            tf.ai.insertNodes(deserializeMd(editor, nodesText))
            // let doubleNewLineSplitArr = nodesText.split("\n\n")
            //
            // doubleNewLineSplitArr.forEach((doubleLineSplitText) => {
            //   console.log("doubleLineSplitText", doubleLineSplitText)
            //   let singleNewLineSplit = doubleLineSplitText.split("\n")
            //   singleNewLineSplit.forEach((singleNewLineSplitText) => {
            //     console.log("singleNewLineSplitText", singleNewLineSplitText)
            //     tf.ai.insertNodes(deserializeMd(editor, singleNewLineSplitText))
            //   })
            // })
          },
          // { split: isFirst }
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
          // TODO: when we want to eventually move to comments, to remove ai previews, comment out below
          tf.ai.insertNodes(nodes);
        },
        { split: true }
      );
    },
  });
};
