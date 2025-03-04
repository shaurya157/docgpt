import * as React from "react";

import { BotIcon, FileIcon } from 'lucide-react';


interface SettingsSidebarItemsProps {
    activeSetting?: string;
    setActiveSetting?: (id: string) => void;
}

const settingsOptions = [
    {
        id: "templates",
        icon: <FileIcon size={20} className="mr-2"/>,
        title: "Templates",
    },
    {
        id: "assistants",
        icon: <BotIcon size={20} className="mr-2"/>,
        title: "Assistants",
    },
]

export const SettingsSidebarItems = ({activeSetting, setActiveSetting}: SettingsSidebarItemsProps) => {
    return (
        <>
            {
                setActiveSetting && settingsOptions.map((item, index) => (
                    <div key={index} className="cursor-pointer group mb-1 flex w-full items-center rounded-md p-1.5" onClick={() => {
                        setActiveSetting(item.id);
                    }}>
                        {item.icon}
                        {item.title}
                    </div>
                ))
            }
        </>
    )
}
