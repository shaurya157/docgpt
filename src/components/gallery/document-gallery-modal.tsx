import { useEffect } from 'react';

import { useUserDataContext } from '@/providers/user-data-provider';

import DocumentGallery from './document-gallery';
interface DocumentGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DocumentGalleryModal({ 
    isOpen, 
    onClose,
}: DocumentGalleryModalProps) {
    const { userOwnedDocuments } = useUserDataContext();

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                    onClick={onClose}
                />
                
                {/* Modal */}
                <div className="relative w-full max-w-7xl bg-white rounded-lg shadow-xl m-4">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-semibold">Open Document</h2>
                        <button
                            className="p-2 hover:bg-gray-100 rounded-full"
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="max-h-[80vh] overflow-y-auto">
                        <DocumentGallery documents={userOwnedDocuments} />
                    </div>
                </div>
            </div>
        </div>
    );
}
