import { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';

import UploadIcon from '../../assets/icons/arrowUp.svg';
import AttachmentIcon from '../../assets/icons/attachment.svg';

interface ChatInputProps {
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  status: 'awaiting_message' | 'in_progress';
  handleSendMessage: (input?: string) => () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  updateAttachments: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput = ({
  inputValue,
  setInputValue,
  status,
  handleSendMessage,
  handleKeyPress,
  updateAttachments,
  fileInputRef,
  textareaRef
}: ChatInputProps) => {
  return (
    <div className="flex w-full items-center gap-1">
      <input
        ref={fileInputRef}
        className="hidden"
        onChange={updateAttachments}
        type="file"
        multiple
      />
      <button
        className="cursor-pointer rounded-lg p-2 hover:bg-gray-200"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image alt="Attach" height={20} src={AttachmentIcon} width={20} />
      </button>
      <textarea
        ref={textareaRef}
        className="height-30 max-h-52 w-full flex-1 overflow-auto p-1 text-gray-600 focus:outline-none"
        disabled={status !== 'awaiting_message'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Help me write about..."
      />
      <button
        className={`rounded-full p-2 ${
          inputValue
            ? 'cursor-pointer bg-black'
            : 'cursor-not-allowed bg-gray-200'
        }`}
        disabled={!inputValue}
        onClick={handleSendMessage()}
      >
        <Image alt="Send" height={18} src={UploadIcon} width={18} />
      </button>
    </div>
  );
};
