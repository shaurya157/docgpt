import { useEffect, useRef, useState } from 'react';

import { type PlateEditor } from '@udecode/plate/react';
import { AlertTriangle, CheckCircle, Loader2, MessageSquare, PenIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { saveUserTemplate, updateDocumentTitle } from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';

import DocGPTIcon from '../../assets/icons/docgpt.svg';
import DocumentGalleryModal from '../gallery/document-gallery-modal';
import TemplateGalleryModal from '../gallery/template-gallery-modal';
import { SignOut } from '../landing/auth';

export type SaveStatus = 'Error' | 'Loading...' | 'Saved' | 'Saving' | 'Unsaved';

// Define the mobile breakpoint (reuse or define locally)
const MOBILE_BREAKPOINT = 768;

const EditableDocumentName = ({ saveStatus }: { saveStatus: SaveStatus }) => {
  const { activeUserDocument, setActiveUserDocument } = useDocument();
  const { setUserOwnedDocuments } = useUserDataContext();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(activeUserDocument?.documentName || 'Untitled');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false); // State for mobile view

  useEffect(() => {
    if (activeUserDocument?.documentName) {
      setName(activeUserDocument.documentName);
    }
  }, [activeUserDocument]);

  // --- Mobile View Detection ---
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const renderSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'Error':
        return <AlertTriangle className="w-4 h-4 ml-2 text-red-600" />;
      case 'Saved':
        return <CheckCircle className="w-4 h-4 ml-2 text-green-600" />;
      case 'Saving':
        return <Loader2 className="w-4 h-4 ml-2 animate-spin" />;
      case 'Loading...':
      case 'Unsaved':
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center">
        {isEditing ? (
          <input
            ref={inputRef}
            // Adjust input width on mobile
            className={`bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-lg font-medium -ml-1 ${
              isMobile ? 'w-36' : 'w-48' 
            }`}
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
          <div className="flex items-center group" onClick={() => setIsEditing(true)}>
            {/* Apply truncate and max-width on mobile */}
            <h1 
              className={`text-lg font-medium cursor-pointer group-hover:border-b group-hover:border-gray-400 ${
                isMobile ? 'truncate max-w-[150px]' : ''
              }`}
              title={name} // Show full name on hover (useful even on desktop)
            >
                {name}
            </h1>
            {renderSaveStatusIcon()}
            <PenIcon className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            
          </div>
        )}
      </div>
    </div>
  );
};

interface DocumentHeaderProps {
  editor: PlateEditor;
  saveStatus: SaveStatus;
  onToggleChat: () => void;
}

const DocumentHeader = ({ editor, saveStatus, onToggleChat }: DocumentHeaderProps) => {
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

  const handleSaveAsTemplate = async () => {
    if (!session?.user?.email) {
      toast.error('You must be logged in to save templates');
      return;
    }

    if (saveStatus !== 'Saved') {
      toast.info('Please wait for changes to save before creating a template.');
      return;
    }

    const templateName = activeUserDocument?.documentName || 'Untitled Template';
    const res = await saveUserTemplate(
      session.user.email,
      templateName,
      editor.children,
      false
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
      <header className="flex h-18 items-center border-b bg-white px-4 justify-between">
        <div className="flex items-center">
          <Image
            className="cursor-pointer w-7 h-7"
            onClick={() => router.push("/home")}
            alt="Home"
            src={DocGPTIcon}
          />

          <div className="flex flex-col items-start ml-3">
            <EditableDocumentName saveStatus={saveStatus} />
            <div className="relative">
              <button
                className="text-sm hover:bg-gray-100 rounded"
                onClick={() => handleDropdownClick('file')}
              >
                File
              </button>
              {activeDropdown === 'file' && (
                <div ref={dropdownRef} className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg z-120">
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => window.open('/document/new', '_blank')}>New</button>
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={handleNewDocFromTemplate}>New from Template</button>
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={handleOpenDocument}>Open Document</button>
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={handleSaveAsTemplate}>Save as Template</button>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="flex items-center space-x-4">
          <button className="p-1.5 rounded hover:bg-gray-100" onClick={onToggleChat} aria-label="Toggle chat panel">
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center">
            {session?.user?.image && (
                <Image
                    className="w-7 h-7 rounded-full mr-2"
                    alt="User profile picture"
                    height={28}
                    src={session.user.image}
                    width={28}
                />
            )}
            <SignOut />
          </div>
        </div>
      </header>

      {isTemplateModalOpen && (
        <TemplateGalleryModal
          onClose={() => setIsTemplateModalOpen(false)}
          isOpen={isTemplateModalOpen}
        />
      )}
      {isDocumentModalOpen && (
        <DocumentGalleryModal
          onClose={() => setIsDocumentModalOpen(false)}
          isOpen={isDocumentModalOpen}
        />
      )}
    </>
  );
};

export default DocumentHeader;
