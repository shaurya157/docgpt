'use client';

import { useEffect, useState } from 'react';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import DocumentGallery from "@/components/gallery/document-gallery";
import TemplateGallery from "@/components/gallery/template-gallery";
import HomeHeader from "@/components/site/home-header";
import { getOwnedTemplates, getUserOwnedDocuments } from "@/firebase/firestore-dao"; 
import { useDocument } from "@/providers/document-provider";
import { useUserDataContext } from "@/providers/user-data-provider";
import { Document, Template } from "@/types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { setUserOwnedDocuments, setUserTemplates, userOwnedDocuments, userTemplates } = useUserDataContext();
  const { providedTemplates } = useDocument();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id) {
        try {
          const docsSnapshot = await getUserOwnedDocuments(session.user.id);
          const templatesSnapshot = await getOwnedTemplates(session.user.id);

          const fetchedDocs = docsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
          const fetchedTemplates = templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
          
          setUserOwnedDocuments(fetchedDocs);
          setUserTemplates(fetchedTemplates);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchData();
  }, [session, setUserOwnedDocuments, setUserTemplates]);

  if (!session?.user) {
    redirect('/');
  }

  const filteredDocuments = userOwnedDocuments?.filter(doc => 
    doc.documentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUserTemplates = userTemplates?.filter(template => 
    template.templateName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProvidedTemplates = providedTemplates?.filter(template => 
    template.templateName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <HomeHeader onSearch={setSearchQuery} />
      <div className="max-w-7xl mx-auto px-4">
        <TemplateGallery 
            providedTemplates={filteredProvidedTemplates}
            userTemplates={filteredUserTemplates}
          />
        <DocumentGallery documents={filteredDocuments} />
      </div>
    </>
  );
}
