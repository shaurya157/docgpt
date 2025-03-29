import { useEffect, useRef, useState } from 'react';

import { type PlateEditor } from '@udecode/plate/react';
import { PenIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { saveCurrentDocumentState, saveUserTemplate, updateDocumentTitle } from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';

import DocGPTIcon from '../../assets/icons/docgpt.svg';
import DocumentGalleryModal from '../gallery/document-gallery-modal';
import TemplateGalleryModal from '../gallery/template-gallery-modal';
import { SignOut } from '../landing/auth';

const EditableDocumentName = () => {
  const { activeUserDocument, setActiveUserDocument } = useDocument();
  const { setUserOwnedDocuments } = useUserDataContext();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(activeUserDocument?.documentName || 'Untitled');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeUserDocument?.documentName) {
      setName(activeUserDocument.documentName);
    }
  }, [activeUserDocument]);

  const handleNameChange = async () => {
    if (!activeUserDocument || name === activeUserDocument.documentName) {
      setIsEditing(false);
      return;
    }

    const res = await updateDocumentTitle(activeUserDocument.id, name);
    if (res.error) {
      toast.error('Failed to update document name');
      setName(activeUserDocument.documentName);
    } else {
      const updatedDoc = { ...activeUserDocument, documentName: name };
      setActiveUserDocument(updatedDoc);
      setUserOwnedDocuments(prev => 
        prev?.map(doc => doc.id === activeUserDocument.id ? updatedDoc : doc)
      );
      toast.success('Document name updated');
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div>
      {isEditing ? (
        <input
          ref={inputRef}
          className="bg-transparent border-b border-gray-300 focus:border-black focus:outline-none px-2 py-1 w-48 text-lg"
          value={name}
          onBlur={handleNameChange}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleNameChange();
            } else if (e.key === 'Escape') {
              setName(activeUserDocument?.documentName || 'Untitled');
              setIsEditing(false);
            }
          }}
          type="text"
        />
      ) : (
        <div className="flex items-center">
          <h1 
            className="text-lg font-medium cursor-pointer hover:border-b hover:border-black"
            onClick={() => setIsEditing(true)}
          >
              {name}
          </h1>
          <PenIcon className="w-3.5 h-3.5 ml-1.5" />
        </div>
      )}
    </div>
  );
};

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
      setUserTemplates(prev => prev ? [newTemplate, ...prev] : [newTemplate]);
      toast.success('Template saved successfully');
    }
    setActiveDropdown(null);
  };

  return (
    <>
      <header className="flex h-12 items-center border-b bg-white px-4 justify-between">
        <div className="flex items-center">
          <Image 
            className="cursor-pointer w-7 h-7" 
            onClick={() => router.push("/home")} 
            alt="Home" 
            src={DocGPTIcon} 
          />
          
          <div className="flex items-center ml-3">
            <EditableDocumentName />
          
            <div ref={dropdownRef} className="flex ml-4">
              <div className="relative">
                <button
                  className="text-sm px-3 hover:bg-[#ECECEC] rounded cursor-pointer text-gray-600"
                  onClick={() => handleDropdownClick('file')}
                >
                  File
                </button>
                {activeDropdown === 'file' && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg py-1 z-50">
                    <button className="w-full px-4 py-2 text-left hover:bg-[#ECECEC] cursor-pointer" onClick={() => window.open("/document/new", "_blank")}>New</button>
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
                  className="text-sm px-3 hover:bg-[#ECECEC] rounded cursor-pointer text-gray-600"
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
        </div>
        <SignOut className="w-24" />
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
