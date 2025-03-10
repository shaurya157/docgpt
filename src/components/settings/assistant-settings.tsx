import { useEffect, useState } from 'react';
import { TrashIcon } from 'lucide-react';

import { Button } from '@/components/plate-ui/button';
import { deleteAssistant, saveAssistant } from '@/firebase/firestore-dao';
import { useUserDataContext, AssistantDefinition } from '@/providers/user-data-provider';
import { useSession } from 'next-auth/react';

export const AssistantSettings = () => {
  const { userAssistants, setUserAssistants } = useUserDataContext();
  const [displayedAssistants, setDisplayedAssistants] = useState(userAssistants);
  const { data: session } = useSession();
  const [activeAssistant, setActiveAssistant] = useState<AssistantDefinition>({
    name: '',
    description: '',
    role: '',
    goals: '',
    rules: '',
    ownerId: session?.user?.email!,
  });

  console.log(userAssistants);
  useEffect(() => {
    setDisplayedAssistants(userAssistants);
  }, [userAssistants]);

  const handleFiltering = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchInput = e.target.value.toLowerCase();
    setDisplayedAssistants(
      userAssistants?.filter(assistant =>
        assistant.name.toLowerCase().includes(searchInput)
      )
    );
  };

  const handleNewAssistant = () => {
    setActiveAssistant({
      name: '',
      description: '',
      role: '',
      goals: '',
      rules: '',
      ownerId: session?.user?.email!,
    });
  };

  const handleSave = async () => {
    const { docId } = await saveAssistant(activeAssistant, activeAssistant.id);
    
    const updatedAssistant = { ...activeAssistant, id: docId };
    const updatedAssistants = activeAssistant.id
      ? userAssistants?.map(a => (a.id === activeAssistant.id ? updatedAssistant : a))
      : [...(userAssistants || []), updatedAssistant];
    
    setUserAssistants(updatedAssistants);
    setActiveAssistant(updatedAssistant);
  };

  const handleDelete = (assistantId: string) => {
    return async () => {
      await deleteAssistant(assistantId);
      const filteredAssistants = userAssistants?.filter(
        (assistant) => assistant.id !== assistantId
      );
      setUserAssistants(filteredAssistants);
    };
  };

  return (
    <div className="w-full flex flex-row items-start">
      <div className="w-1/5 p-4 border-r border-gray-300 h-full">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-semibold ">Assistant Settings</h1>
          <Button variant="roundedClear" onClick={handleNewAssistant}>New</Button>
        </div>
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={handleFiltering}
          placeholder="Filter by name"
          type="text"
        />
        {displayedAssistants?.map((assistant, idx) => (
          <div key={idx}
               className="flex flex-row items-center justify-between group/assistants w-full mt-2 hover:bg-slate-200 p-2 cursor-pointer"
               onClick={() => setActiveAssistant(assistant)}>
            <div>{assistant.name}</div>
            <TrashIcon 
              className="group-hover/assistants:block hidden"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(assistant.id!)();
              }}
            />
          </div>
        ))}
      </div>
      <div className="w-3/5 p-4">
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={activeAssistant.name}
              onChange={(e) => setActiveAssistant({...activeAssistant, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-md border p-2"
              value={activeAssistant.description}
              onChange={(e) => setActiveAssistant({...activeAssistant, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={activeAssistant.role}
              onChange={(e) => setActiveAssistant({...activeAssistant, role: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Goals</label>
            <textarea
              className="mt-1 w-full rounded-md border p-2"
              value={activeAssistant.goals}
              onChange={(e) => setActiveAssistant({...activeAssistant, goals: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rules</label>
            <textarea
              className="mt-1 w-full rounded-md border p-2"
              value={activeAssistant.rules}
              onChange={(e) => setActiveAssistant({...activeAssistant, rules: e.target.value})}
            />
          </div>
          <Button onClick={handleSave}>Save Assistant</Button>
        </div>
      </div>
    </div>
  );
};