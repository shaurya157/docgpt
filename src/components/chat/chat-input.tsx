import { Dispatch, SetStateAction } from 'react';

import Image from 'next/image';

import UploadIcon from '../../assets/icons/arrowUp.svg';
import AttachmentIcon from '../../assets/icons/attachment.svg';

interface ChatInputProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  status: 'awaiting_message' | 'in_progress';
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleSendMessage: (input?: string) => () => Promise<void>;
  updateAttachments: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChatInput = ({
  fileInputRef,
  inputValue,
  setInputValue,
  status,
  textareaRef,
  updateAttachments,
  handleKeyPress,
  handleSendMessage
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
      <textarea
        ref={textareaRef}
        className="height-30 max-h-52 w-full flex-1 overflow-auto p-1 text-gray-600 focus:outline-none"
        disabled={status !== 'awaiting_message'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Message DocGPT"
      />
      <div className="flex items-center gap-1">
        <button
          className="cursor-pointer rounded-lg p-2 hover:bg-gray-200"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image alt="Attach" height={20} src={AttachmentIcon} width={20} />
        </button>
        <button
          className={`rounded-md px-3 py-1 ${
            inputValue
              ? 'cursor-pointer bg-black text-white'
              : 'cursor-not-allowed bg-gray-200 text-gray-500'
          }`}
          disabled={!inputValue}
          onClick={handleSendMessage()}
        >
          Send
        </button>
      </div>
    </div>
  );
};
