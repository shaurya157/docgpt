import { useRouter } from 'next/navigation';

import { Template } from '@/types';

import { Button } from '../plate-ui/button';
import GalleryItem from './gallery-item';

interface TemplateGalleryProps {
    providedTemplates?: Template[] | null;
    userTemplates?: Template[] | null;
}

export default function TemplateGallery({ providedTemplates, userTemplates }: TemplateGalleryProps) {
    const router = useRouter();

    const handleNewDocumentClick = () => {
        router.push('/document/new');
    };

    return (
        <div className="p-4">
            <Button 
                variant="default"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-6 text-base w-full sm:w-auto mb-6"
                onClick={handleNewDocumentClick}
            >
                Start with a blank doc
            </Button>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold">Start with a template</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
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
            </div>
        </div>
    )
}

