'use client';

import { useState } from 'react';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import DocumentGallery from "@/components/gallery/document-gallery";
import TemplateGallery from "@/components/gallery/template-gallery";
import HomeHeader from "@/components/site/home-header";
import { useDocument } from "@/providers/document-provider"; 
import { useUserDataContext } from "@/providers/user-data-provider";

interface Template {
    id: string;
    template: any[];
    templateName: string;
    templateOwnerId: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { userOwnedDocuments, userTemplates } = useUserDataContext();
  const { providedTemplates } = useDocument();
  const { data: session } = useSession();

  // TODO: a bit hacky...
  if (!session?.user) {
    redirect('/');
  }

  const filteredDocuments = userOwnedDocuments?.filter(doc => 
    doc.documentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUserTemplates = userTemplates?.map(t => t as unknown as Template).filter(template => 
    template.templateName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProvidedTemplates = providedTemplates?.filter(template => 
    template.templateName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <HomeHeader onSearch={setSearchQuery} />
      <div>
        <TemplateGallery 
            providedTemplates={filteredProvidedTemplates}
            userTemplates={filteredUserTemplates}
          />
        <DocumentGallery documents={filteredDocuments} />
        
      </div>
    </>
  );
}
