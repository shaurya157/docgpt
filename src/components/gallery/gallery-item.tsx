import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteChat, deleteDocument, deleteTemplate } from '@/firebase/firestore-dao';
import { useUserDataContext } from '@/providers/user-data-provider';

interface GalleryItemProps {
    title: string;
    isBlank?: boolean;
    isOwner?: boolean;
    itemId?: string;
    itemType?: 'document' | 'template';
    template?: TemplateNode[];
}

interface TemplateNode {
    id: string;
    children: { text: string }[];
    type: string;
}

export default function GalleryItem({ isBlank, isOwner, itemId, itemType, template, title }: GalleryItemProps) {
    const router = useRouter();
    const { setUserChats, setUserOwnedDocuments, setUserTemplates, userChats, userOwnedDocuments, userTemplates } = useUserDataContext();

    const deleteUserData = async (chat: any) => {
        // 1. Get all file IDs from chat
        const fileIds = chat.files?.reduce((acc: string[], file: any) => [...acc, ...file.fileIds], []) || [];
    
        // 2. Delete files from Pinecone if any exist
        if (fileIds.length > 0) {
          try {
            await fetch('/api/ai/files', {
              body: JSON.stringify({ fileIds }),
              headers: { 'Content-Type': 'application/json' },
              method: 'DELETE'
            });
          } catch (e) {
            console.error('Error deleting files:', e);
            toast.error('Error deleting files');
          }
        }
    
        // 3. Delete document from Firestore
        if (chat.documentIds?.length > 0) {
          for (const docId of chat.documentIds) {
            const docRes = await deleteDocument(docId);
            if (docRes.error) {
              console.error('Error deleting document:', docRes.error);
              toast.error(`Error deleting document: ${docRes.error}`);
              return false;
            }
          }
        }
    
        // 4. Delete chat from Firestore
        const chatRes = await deleteChat(chat.id);
        if (chatRes?.error) {
          console.error('Error deleting chat:', chatRes.error);
          toast.error(`Error deleting chat: ${chatRes.error}`);
          return false;
        }
    
        return true;
    };
    
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the parent onClick

        if (!itemId) {
            toast.error('Item ID not found');
            return;
        }

        if (itemType === 'template') {
            try {
                const res = await deleteTemplate(itemId);
                if (res.error) {
                    toast.error('Failed to delete template');
                    return;
                }
                setUserTemplates(prev => prev?.filter(template => template.id !== itemId));
                toast.success('Template deleted successfully');
            } catch (error) {
                toast.error('Failed to delete template');
            }
        } else if (itemType === 'document') {
            const chat = userChats?.find(c => c.documentIds?.includes(itemId));
            if (!chat) {
                toast.error('Associated chat not found');
                return;
            }

            const success = await deleteUserData(chat);
            if (success) {
                setUserChats(prev => prev?.filter(c => c.id !== chat.id));
                setUserOwnedDocuments(prev => prev?.filter(doc => !chat.documentIds.includes(doc.id)));
                toast.success('Document deleted successfully');
            }
        }
    };

    const handleClick = () => {
        if (isBlank) {
            router.push('/document/new');
        } else if (itemType === 'document' && itemId) {
            router.push(`/document/${itemId}`);
        } else if (itemType === 'template' && itemId) {
            router.push(`/document/new?templateId=${itemId}`);
        }
    };

    const renderPreview = () => {
        if (!template) return null;
        
        return template.map((node, index) => {
            const text = node.children[0]?.text;
            if (!text) return null;
            
            switch (node.type) {
                case 'h1':
                    return <h1 key={node.id} className="text-[8px] font-bold mb-1">{text}</h1>;
                case 'h2':
                    return <h2 key={node.id} className="text-[7px] font-semibold mb-0.5 ml-1">{text}</h2>;
                case 'h3':
                    return <h3 key={node.id} className="text-[6px] font-medium mb-0.5 ml-2">{text}</h3>;
                case 'p':
                    return <p key={node.id} className="text-[6px] mb-0.5 ml-1">{text}</p>;
                default:
                    return null;
            }
        });
    };

    return (
        <div className="relative group cursor-pointer" onClick={handleClick}>
            <div className="w-48 h-64 border rounded-lg bg-white hover:border-gray-400 transition-colors p-3 overflow-hidden relative">
                {isBlank ? (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-4xl text-gray-400">+</span>
                    </div>
                ) : (
                    <div className="w-full h-full bg-white">
                        {renderPreview()}
                        {isOwner && (
                            <Trash2 
                                className="absolute bottom-2 right-2 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all cursor-pointer" 
                                onClick={handleDelete}
                            />
                        )}
                    </div>
                )}
            </div>
            {isOwner && itemType === 'template' && (
                <div className="absolute -top-2 left-2 bg-gray-100 px-2 py-0.5 text-xs rounded">
                    Saved template
                </div>
            )}
            <p className="mt-2 text-sm text-center text-gray-600">{title}</p>
        </div>
    )
}

