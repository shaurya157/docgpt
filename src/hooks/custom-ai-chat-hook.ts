import {getBlockAbove, TText} from '@udecode/plate-common';
import { useEditorPlugin } from '@udecode/plate-common/react';
import { deserializeInlineMd } from '@udecode/plate-markdown';
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
            // TODO: Feels hacky
            let nodesText = nodes[0].text
            let splitText = nodesText.split("\n\n")

            splitText.forEach((text) => {
              let tempText = text;
              let type: string;
              if (text.startsWith("###### ")) {
                type = HEADING_KEYS.h6
                tempText = text.replace(/^(###### )/, "")
              } else if (text.startsWith("###### ")) {
                type = HEADING_KEYS.h5
                tempText = text.replace(/^(##### )/, "")
              } else if (text.startsWith("#### ")) {
                type = HEADING_KEYS.h4
                tempText = text.replace(/^(#### )/, "")
              } else if (text.startsWith("### ")) {
                type = HEADING_KEYS.h3
                tempText = text.replace(/^(### )/, "")
              } else if (text.startsWith("## ")) {
                type = HEADING_KEYS.h2
                tempText = text.replace(/^(## )/, "")
              } else if (text.startsWith("# ")) {
                type = HEADING_KEYS.h1
                tempText = text.replace(/^(# )/, "")
              } else {
                type = "paragraph"
              }

              Transforms.insertNodes(
                editor,
                // @ts-ignore
                { type, children: [{ text: text + "\n" }] }
              )
            })
            //
            // tf.ai.insertNodes(nodes);
            console.log("Editor children: ", editor.children)
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
          // TODO: when we want to eventually move to comments, to remove ai previews, comment out below
          tf.ai.insertNodes(nodes);
        },
        { split: true }
      );
    },
  });
};
