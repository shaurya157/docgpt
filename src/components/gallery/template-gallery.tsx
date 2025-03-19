import { Template } from '@/types';

import GalleryItem from './gallery-item';

interface TemplateGalleryProps {
    providedTemplates?: Template[] | null;
    userTemplates?: Template[] | null;
}

export default function TemplateGallery({ providedTemplates, userTemplates }: TemplateGalleryProps) {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Start a new document</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                <GalleryItem title="Blank document" isBlank />
                
                {userTemplates?.map((template, index) => (
                    <GalleryItem 
                        key={`user-${index}`}
                        title={template.templateName}
                        isOwner={true}
                        itemId={template.id}
                        itemType="template"
                        template={template.template}
                    />
                ))}
                
                {providedTemplates?.map((template, index) => (
                    <GalleryItem 
                        key={`provided-${index}`}
                        title={template.templateName}
                        isOwner={false}
                        itemId={template.id}
                        itemType="template"
                        template={template.template}
                    />
                ))}
                
                <GalleryItem title="Explore more templates" />
            </div>
        </div>
    )
}

