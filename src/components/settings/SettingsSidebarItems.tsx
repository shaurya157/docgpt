import {MenuItem} from "@/types";
import {FileIcon} from "lucide-react";
import * as React from "react";
import {useState} from "react";

interface SettingsSidebarItemsProps {
    items: MenuItem[] | null | undefined;
}

const settingsOptions = [
    {
        id: "templates",
        icon: <FileIcon size={20} className="mr-2"/>,
        title: "Templates",
        href: "settings/templates",
    }
]

export const SettingsSidebarItems = () => {
    const activeSetting = useState("templates")

    return (
        <>
            {
                settingsOptions.map((item, index) => (
                    <div key={index} className="cursor-pointer group mb-1 flex w-full items-center rounded-md p-1.5">
                        {item.icon}
                        {item.title}
                    </div>
                ))
            }

        </>
    )
}
