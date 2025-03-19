import { useRouter } from 'next/navigation';

interface TemplateNode {
    type: string;
    children: { text: string }[];
    id: string;
}

interface GalleryItemProps {
    title: string;
    isBlank?: boolean;
    isSaved?: boolean;
    template?: TemplateNode[];
    itemId?: string;
    itemType?: 'document' | 'template';
}

export default function GalleryItem({ title, isBlank, isSaved, template, itemId, itemType }: GalleryItemProps) {
    const router = useRouter();

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
            <div className="w-48 h-64 border rounded-lg bg-white hover:border-gray-400 transition-colors p-3 overflow-hidden">
                {isBlank ? (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-4xl text-gray-400">+</span>
                    </div>
                ) : (
                    <div className="w-full h-full bg-white">
                        {renderPreview()}
                    </div>
                )}
            </div>
            {isSaved && (
                <div className="absolute -top-2 left-2 bg-gray-100 px-2 py-0.5 text-xs rounded">
                    Saved template
                </div>
            )}
            <p className="mt-2 text-sm text-center text-gray-600">{title}</p>
        </div>
    )
}

