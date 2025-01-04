import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  appendFileDataToUser,
  deleteUserUploadedFile,
} from '@/firebase/firestore-dao';
import {
  FileInfo,
  useUserDataContext,
} from '@/providers/user-data-context-provider';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import FolderIcon from '../../assets/icons/folder.svg';
import InfoIcon from '../../assets/icons/info.svg';
import RemoveIcon from '../../assets/icons/remove.svg';
import CloseIcon from '../../assets/icons/x.svg';
import Tooltip from './Tooltip';

interface ContextDocsContentProps {
  onClose: () => void;
}

const ContextDocsContent = ({ onClose }: ContextDocsContentProps) => {
  const [dragActive, setDragActive] = useState(false);

  const { data: session } = useSession();
  const { files, vectorStoreId } = useUserDataContext();
  const [documents, setDocuments] = useState<FileInfo[]>(files!);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log(files);
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const validFiles = Array.from(files).filter((file) =>
      allowedTypes.includes(file.type)
    );

    const formData = new FormData();
    formData.append('vectorStoreId', vectorStoreId!);
    formData.append('userId', session!.user!.email!);
    validFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      let response = await fetch('/api/ai/files', {
        method: 'POST',
        body: formData,
      });

      let responseJson = await response.json();

      await appendFileDataToUser(
        session!.user!.email!,
        responseJson['openAiFileIds']
      );
      toast.success('Success uploading file!');
    } catch (e) {
      toast.error(
        `Something went wrong while uploading. Please refresh the page and try again. Error: ${e}`
      );
    }

    const newDocs = validFiles.map((file) => ({
      openAiFileId: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      // You can add more properties like size, type, etc.
    }));

    setDocuments((prev) => [...prev, ...newDocs]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (openAiFileId: string, fileName: string) => {
    let response = await fetch('/api/ai/files', {
      method: 'DELETE',
      body: JSON.stringify({ openAiFileId }),
    });

    let responseJson = await response.json();
    console.log(openAiFileId, fileName);
    if (response.ok) {
      const res = await deleteUserUploadedFile(
        session!.user!.email!,
        fileName,
        openAiFileId
      );

      if (!res.error) {
        toast.success('Successfully deleted');
      } else {
        toast.error(`Error deleting file. Error: ${res.error.message}`);
      }
    } else {
      console.log(`Error deleting! Error: ${responseJson.message}`);
    }
    setDocuments((prev) =>
      prev.filter((doc) => doc.openAiFileId !== openAiFileId)
    );
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-[350px] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Context Documents</h2>
          <Tooltip
            title="Get more relevant responses"
            content="Upload files here that you would use to onboard a new team member. DocGPT will search these files for context when answering questions for you across every chat."
          >
            <button className="rounded-full p-1 hover:bg-[#ECECEC]">
              <Image src={InfoIcon} alt="Info" width={20} height={20} />
            </button>
          </Tooltip>
        </div>
        <button className="rounded-lg p-1 hover:bg-[#ECECEC]" onClick={onClose}>
          <Image src={CloseIcon} alt="Close" width={21} height={21} />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.txt"
      />

      <div
        className={`relative rounded-xl border border-gray-200 bg-gray-50 text-sm ${
          dragActive ? 'border-solid border-black' : 'border-dashed'
        } mb-4 p-7 transition-all duration-200`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black bg-opacity-5">
            <div className="font-medium text-gray-800">Drop files here</div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center text-center">
          <p className="mb-2 text-gray-600">Drop files here to upload...</p>
          <button
            className="rounded-lg bg-[#ECECEC] px-4 py-2 text-gray-700 transition-colors hover:bg-[#DFDFDF]"
            onClick={handleBrowseClick}
          >
            Browse files
          </button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="max-h-[150px] overflow-y-auto rounded-xl border">
          {documents.map((doc, idx) => (
            <div
              key={doc.openAiFileId + idx}
              className="group flex cursor-pointer items-center justify-between rounded-lg p-2 hover:rounded-none hover:bg-[#ECECEC]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Image src={FolderIcon} alt="doc" width={16} height={16} />
                <span className="truncate text-sm text-gray-700">
                  {doc.fileName}
                </span>
              </div>
              <button
                className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:bg-gray-200 hover:text-gray-600"
                onClick={() => handleDeleteFile(doc.openAiFileId, doc.fileName)}
              >
                <Image src={RemoveIcon} alt="remove" width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContextDocsContent;
