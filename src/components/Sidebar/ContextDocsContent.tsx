import Image from "next/image";
import FolderIcon from "../../assets/icons/folder.svg";
import CloseIcon from "../../assets/icons/x.svg";
import RemoveIcon from "../../assets/icons/remove.svg";
import InfoIcon from "../../assets/icons/info.svg";
import Tooltip from "./Tooltip";

interface ContextDocsContentProps {
  onClose: () => void;
}

const sampleDocs = [
  { id: "doc1", name: "Doc1.pdf" },
  { id: "doc2", name: "Doc2.pdf" },
  { id: "doc3", name: "Doc3.pdf" },
  { id: "doc4", name: "Doc4.pdf" },
  { id: "doc5", name: "Doc5.pdf" },
  { id: "doc6", name: "Doc6.pdf" },
  { id: "doc7", name: "Doc7.pdf" },
  { id: "doc8", name: "Doc8.pdf" },
  { id: "doc9", name: "Doc9.pdf" },
  { id: "doc10", name: "Doc10.pdf" },
];

const ContextDocsContent = ({ onClose }: ContextDocsContentProps) => {
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

      <div className="bg-gray-50 rounded-xl border text-sm border-gray-200 border-dashed p-7 mb-4">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-gray-600 mb-2">Drop files here to upload...</p>
          <button className="bg-[#ECECEC] hover:bg-[#ECECEC] text-gray-700 p-2 rounded-lg">
            Browse files
          </button>
        </div>
      </div>

      <div className="max-h-[150px] overflow-y-auto rounded-xl border">
        {sampleDocs.map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 cursor-pointer rounded-lg group hover:bg-[#ECECEC] hover:rounded-none "
          >
            <div className="flex items-center gap-2 min-w-0">
              <Image src={FolderIcon} alt="doc" width={16} height={16} />
              <span className="text-gray-700 text-sm truncate">{doc.name}</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1 transition-opacity shrink-0">
              <Image src={RemoveIcon} alt="remove" width={16} height={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextDocsContent;
