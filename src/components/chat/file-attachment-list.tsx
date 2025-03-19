import { Icons } from '@/components/icons';
import Image from 'next/image';
import CloseIcon from '@/assets/icons/x.svg';

interface FileAttachment {
  fileName: string;
  status: string;
}

interface FileAttachmentListProps {
  attachments: FileAttachment[];
  onRemove: (index: number) => void;
}

export const FileAttachmentList = ({ attachments, onRemove }: FileAttachmentListProps) => {
  if (attachments.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1"
        >
          {attachment.status === 'uploading' ? (
            <Icons.spinner className="size-5 animate-spin text-black" />
          ) : null}
          <span className="text-gray-700">{attachment.fileName}</span>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => onRemove(index)}
          >
            <Image alt="close" height={16} src={CloseIcon} width={16} />
          </button>
        </div>
      ))}
    </div>
  );
}; 