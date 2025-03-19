import { HomeIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import TemplateGalleryModal from '../gallery/template-gallery-modal';
import DocumentGalleryModal from '../gallery/document-gallery-modal';

const DocumentHeader = () => {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownClick = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const handleNewDocFromTemplate = () => {
    setActiveDropdown(null);
    setIsTemplateModalOpen(true);
  };

  const handleOpenDocument = () => {
    setActiveDropdown(null);
    setIsDocumentModalOpen(true);
  };

  return (
    <>
      <header className="flex h-16 items-center border-b bg-white px-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-2" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => handleDropdownClick('file')}
                className="px-3 py-1 hover:bg-[#ECECEC] rounded cursor-pointer"
              >
                File
              </button>
              {activeDropdown === 'file' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg py-1 z-50">
                  <button className="w-full px-4 py-2 text-left hover:bg-[#ECECEC]">New doc: Blank</button>
                  <button 
                    className="w-full px-4 py-2 text-left hover:bg-[#ECECEC]"
                    onClick={handleNewDocFromTemplate}
                  >
                    New doc from template
                  </button>
                  <button 
                    className="w-full px-4 py-2 text-left hover:bg-[#ECECEC]"
                    onClick={handleOpenDocument}
                  >
                    Open
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-[#ECECEC]">Save</button>
                  <button className="w-full px-4 py-2 text-left hover:bg-[#ECECEC]">Save as new template</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => handleDropdownClick('help')}
                className="px-3 py-1 hover:bg-[#ECECEC] rounded cursor-pointer"
              >
                Help
              </button>
              {activeDropdown === 'help' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg py-1 z-50">
                  <a href="mailto:hello@docgpt.work" className="block px-4 py-2 text-left hover:bg-[#ECECEC]">
                    Email: hello@docgpt.work
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          className="rounded-lg p-2 hover:bg-[#ECECEC] cursor-pointer" 
          onClick={() => { router.push("/home") }}
        >
          <HomeIcon/>
        </button>
      </header>

      <TemplateGalleryModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />

      <DocumentGalleryModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
      />
    </>
  );
};

export default DocumentHeader;
