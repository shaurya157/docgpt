import { useEffect, useRef, useState } from 'react';

import { type PlateEditor } from '@udecode/plate/react';
import { HomeIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { saveCurrentDocumentState, saveUserTemplate } from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';
import DocumentGalleryModal from '../gallery/document-gallery-modal';
import TemplateGalleryModal from '../gallery/template-gallery-modal';

interface DocumentHeaderProps {
  editor: PlateEditor;
}

const DocumentHeader = ({ editor }: DocumentHeaderProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { activeUserDocument } = useDocument();
  const { setUserTemplates, userTemplates } = useUserDataContext();
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

  const handleSaveDocument = async () => {
    if (!activeUserDocument || !session?.user?.email) {
      toast.error('No active document to save');
      return;
    }

    const res = await saveCurrentDocumentState(
      session.user.email,
      activeUserDocument.documentName,
      activeUserDocument.chatId,
      editor.children,
      activeUserDocument.id
    );

    if (res.error) {
      toast.error('Error saving document');
    } else {
      toast.success('Document saved successfully');
    }
    setActiveDropdown(null);
  };

  const handleSaveAsTemplate = async () => {
    if (!session?.user?.email) {
      toast.error('You must be logged in to save templates');
      return;
    }

    const templateName = activeUserDocument?.documentName || 'Untitled Template';
    const res = await saveUserTemplate(
      session.user.email,
      templateName,
      editor.children,
      false // new template, so not template owner
    );

    if (res.error) {
      toast.error('Error saving template');
    } else {
      const newTemplate = {
        id: res.docId,
        template: editor.children,
        templateName: templateName,
        templateOwnerId: session.user.email
      };
      setUserTemplates((prev) => {
        const currentTemplates = prev || [];
        return [newTemplate, ...currentTemplates];
      });
      toast.success('Template saved successfully');
    }
    setActiveDropdown(null);
  };

  return (
    <>
      <header className="flex h-16 items-center border-b bg-white px-4 justify-between">
        <div className="flex items-center gap-4">
          <div ref={dropdownRef} className="flex gap-2">
            <div className="relative">
              <button
                className="px-3 py-1 hover:bg-[#ECECEC] rounded cursor-pointer"
                onClick={() => handleDropdownClick('file')}
              >
                File
              </button>
              {activeDropdown === 'file' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg py-1 z-50">
                  <button className="w-full px-4 py-2 text-left hover:bg-[#ECECEC] cursor-pointer">New</button>
                  <button 
                    className="w-full px-4 py-2 text-left hover:bg-[#ECECEC] cursor-pointer"
                    onClick={handleNewDocFromTemplate}
                  >
                    New from template
                  </button>
                  <button 
                    className="w-full px-4 py-2 text-left hover:bg-[#ECECEC] cursor-pointer"
                    onClick={handleOpenDocument}
                  >
                    Open
                  </button>
                  <button 
                    className="w-full px-4 py-2 text-left hover:bg-[#ECECEC] cursor-pointer"
                    onClick={handleSaveDocument}
                  >
                    Save
                  </button>
                  <button 
                    className="w-full px-4 py-2 text-left hover:bg-[#ECECEC] cursor-pointer"
                    onClick={handleSaveAsTemplate}
                  >
                    Save as new template
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="px-3 py-1 hover:bg-[#ECECEC] rounded cursor-pointer"
                onClick={() => handleDropdownClick('help')}
              >
                Help
              </button>
              {activeDropdown === 'help' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg py-1 z-50">
                  <a className="block px-4 py-2 text-left hover:bg-[#ECECEC]" href="mailto:hello@docgpt.work">
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
        onClose={() => setIsTemplateModalOpen(false)}
        isOpen={isTemplateModalOpen}
      />

      <DocumentGalleryModal
        onClose={() => setIsDocumentModalOpen(false)}
        isOpen={isDocumentModalOpen}
      />
    </>
  );
};

export default DocumentHeader;
