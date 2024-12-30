import { useRef, useState } from "react";
import Image from "next/image";
import FolderIcon from "../../assets/icons/folder.svg";
import CloseIcon from "../../assets/icons/x.svg";
import RemoveIcon from "../../assets/icons/remove.svg";
import InfoIcon from "../../assets/icons/info.svg";
import Tooltip from "./Tooltip";

interface ContextDocsContentProps {
  onClose: () => void;
}

interface Document {
  id: string;
  name: string;
}

const ContextDocsContent = ({ onClose }: ContextDocsContentProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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

  const handleFiles = (files: FileList) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = Array.from(files).filter((file) =>
      allowedTypes.includes(file.type)
    );

    const newDocs = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      // You can add more properties like size, type, etc.
    }));

    setDocuments((prev) => [...prev, ...newDocs]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 w-[350px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Context Documents</h2>
          <Tooltip
            title="Get more relevant responses"
            content="Upload files here that you would use to onboard a new team member. DocGPT will search these files for context when answering questions for you across every chat."
          >
            <button className="rounded-full hover:bg-[#ECECEC] p-1">
              <Image src={InfoIcon} alt="Info" width={20} height={20} />
            </button>
          </Tooltip>
        </div>
        <button className="p-1 hover:bg-[#ECECEC] rounded-lg" onClick={onClose}>
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
        className={`relative bg-gray-50 rounded-xl border text-sm border-gray-200 ${
          dragActive ? "border-black border-solid" : "border-dashed"
        } p-7 mb-4 transition-all duration-200`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive && (
          <div className="absolute inset-0 bg-black bg-opacity-5 rounded-xl flex items-center justify-center">
            <div className="text-gray-800 font-medium">Drop files here</div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-gray-600 mb-2">Drop files here to upload...</p>
          <button
            className="bg-[#ECECEC] hover:bg-[#DFDFDF] text-gray-700 px-4 py-2 rounded-lg transition-colors"
            onClick={handleBrowseClick}
          >
            Browse files
          </button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="max-h-[150px] overflow-y-auto rounded-xl border">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2 cursor-pointer rounded-lg group hover:bg-[#ECECEC] hover:rounded-none"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Image src={FolderIcon} alt="doc" width={16} height={16} />
                <span className="text-gray-700 text-sm truncate">
                  {doc.name}
                </span>
              </div>
              <button
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all duration-200 shrink-0"
                onClick={() => removeDocument(doc.id)}
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
