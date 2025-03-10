import { useEffect, useState } from 'react';

import { TrashIcon } from 'lucide-react';

import { PlateEditor } from '@/components/editor/plate-editor';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Button } from '@/components/plate-ui/button';
import { deleteTemplate } from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';

export const TemplateSettings = () => {
  const {setUserTemplates, userTemplates} = useUserDataContext();
  const {providedTemplates} = useDocument();
  const [displayedTemplatesTitle, setDisplayedTemplatesTitle] = useState<"owned" | "provided">("owned")
  const [displayedTemplates, setDisplayedTemplates] = useState(displayedTemplatesTitle === "owned" ? providedTemplates : userTemplates)
  const editor = useCreateEditor()
  const { setActiveTemplate } = useDocument();

  useEffect(() => {
    displayedTemplatesTitle === "provided" ? setDisplayedTemplates(providedTemplates) : setDisplayedTemplates(userTemplates)
  }, [displayedTemplatesTitle, providedTemplates, userTemplates]);

  const handleTitleChange = (title: "owned" | "provided") => {
    return () => {
      title === "provided" ? setDisplayedTemplates(providedTemplates) : setDisplayedTemplates(userTemplates)
      setDisplayedTemplatesTitle(title)
    }
  }

  const handleTemplateChange = (template) => {
    setActiveTemplate(template)
    editor.tf.setValue(template["template"])
  }

  const handleFiltering = (e) => {
    const searching = displayedTemplatesTitle === "provided" ? providedTemplates : userTemplates
    const searchInput = (e.target.value as string).toLowerCase()

    setDisplayedTemplates(
      searching?.filter(templ =>
        (templ["templateName"] as string).toLowerCase().includes(searchInput) || (templ["templateOwnerId"] as string).toLowerCase().includes(searchInput)
      )
    )
  }

  const handleNewTemplate = () => {
    const emptyEditor = [
      {
        id: '1',
        children: [
          {
            text: '',
          },
        ],
        type: 'h1',
      },
    ]

    setActiveTemplate({
      template: emptyEditor,
      templateName: "New Template"
    })
    editor.tf.setValue(emptyEditor)
  }

  const handleDelete = (templateId: string) => {
    return async () => {
      await deleteTemplate(templateId);
      const filteredTemplates = userTemplates?.filter(
        (templ) => templ['id'] !== templateId
      );
      setUserTemplates(filteredTemplates);
    };
  };

  return (
    <div className="w-full flex flex-row items-start">
      <div className="w-1/5 p-4">
        <div className="flex justify-between mb-2">
          <h1 className="text-xl font-semibold ">Template Settings</h1>
          <Button variant="roundedClear" onClick={handleNewTemplate}>New</Button>
        </div>
        <div className="mb-2">
          <span className={displayedTemplatesTitle === "owned" ? "underline" : "cursor-pointer"} onClick={handleTitleChange("owned")}>Owned</span>
          <span> | </span>
          <span className={displayedTemplatesTitle === "provided" ? "underline" : "cursor-pointer"} onClick={handleTitleChange("provided")}>Provided</span>
        </div>
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={handleFiltering}
          placeholder="Filter by name or owner"
          type="text"
        />
        {
          displayedTemplates?.map((templ, idx) => (
            <div key={idx}
                 className="flex flex-row items-center justify-between group/templates w-full w-full mt-2 hover:bg-slate-200 p-2 cursor-pointer" onClick={() => { handleTemplateChange(templ) } }>
              <div>
                {templ['templateName']}
              </div>
              <TrashIcon className={displayedTemplatesTitle === "owned" ? "group-hover/templates:block" : "hidden"} onClick={handleDelete(templ["id"])}/>
            </div>
          ))
        }
      </div>
      <div
        className="z-10 overflow-y-scroll border bg-background shadow w-4/5 h-full"
      >
        <PlateEditor plateEditor={editor} />
      </div>
    </div>
  )
}