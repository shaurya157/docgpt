import GalleryItem from './gallery-item';
import { Document } from '@/types';

interface DocumentGalleryProps {
    documents?: Document[];
}

export default function DocumentGallery({ documents }: DocumentGalleryProps) {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Your Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                <GalleryItem title="Create new document" isBlank />
                
                {documents?.map((doc, index) => (
                    <GalleryItem 
                        key={`doc-${index}`}
                        title={doc.documentName}
                        template={doc.document}
                        itemId={doc.id}
                        itemType="document"
                    />
                ))}
            </div>
        </div>
    )
}

