import { useEffect } from 'react';
import TemplateGallery from './template-gallery';
import { Template } from '@/types';
import { useUserDataContext } from '@/providers/user-data-provider';
import { useDocument } from '@/providers/document-provider';
interface TemplateGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TemplateGalleryModal({ 
    isOpen, 
    onClose,
     
}: TemplateGalleryModalProps) {
    const { userTemplates } = useUserDataContext();
    const { providedTemplates } = useDocument();

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
                        <h2 className="text-xl font-semibold">Choose a Template</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="max-h-[80vh] overflow-y-auto">
                        {
                            userTemplates && providedTemplates ? (
                                <TemplateGallery 
                                    userTemplates={userTemplates}
                                    providedTemplates={providedTemplates}
                                />
                            ) : null
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
