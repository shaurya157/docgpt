import GalleryItem from './gallery-item';
import { Template } from '@/types';

interface TemplateGalleryProps {
    userTemplates?: Template[] | null;
    providedTemplates?: Template[] | null;
}

export default function TemplateGallery({ userTemplates, providedTemplates }: TemplateGalleryProps) {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Start a new document</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                <GalleryItem title="Blank document" isBlank />
                
                {userTemplates?.map((template, index) => (
                    <GalleryItem 
                        key={`user-${index}`}
                        title={template.templateName}
                        template={template.template}
                        itemId={template.id}
                        itemType="template"
                        isOwner={true}
                    />
                ))}
                
                {providedTemplates?.map((template, index) => (
                    <GalleryItem 
                        key={`provided-${index}`}
                        title={template.templateName}
                        template={template.template}
                        itemId={template.id}
                        itemType="template"
                        isOwner={false}
                    />
                ))}
                
                <GalleryItem title="Explore more templates" />
            </div>
        </div>
    )
}

