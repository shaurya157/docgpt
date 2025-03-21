import Image from 'next/image';
import { ContextMentionOption } from '@/types';
import CloseIcon from '@/assets/icons/x.svg';

interface ContextListProps {
  selectedContexts?: ContextMentionOption[];
  onRemove: (index: number) => void;
  inputValue?: string;
}

export const ContextList = ({ 
  selectedContexts = [], 
  onRemove,
  inputValue = ''
}: ContextListProps) => {
  // We want to show all selected contexts in the list
  // These are contexts that were explicitly selected by the user
  if (!selectedContexts?.length) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {selectedContexts.map((context, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1"
        >
          <span className="text-gray-700">@{context.value}</span>
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