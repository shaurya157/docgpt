import Image from "next/image";

import DeleteIcon from "@/assets/icons/delete.svg";
import {MenuItem} from "@/types";

interface ChatSidebarItemsProps {
    items: MenuItem[] | null | undefined;
    onDeleteChat: (chatId: string) => void;
    setActiveItem: (id: MenuItem, documentRefreshOnly: boolean) => void;
    activeUserDocument?: {} | string;
}

export const ChatSidebarItems = ({activeUserDocument, items, setActiveItem, onDeleteChat}: ChatSidebarItemsProps) => {
    return (
        <>
            {items?.map((item, idx) => (
                <div
                    key={idx}
                    className={`cursor-pointer group mb-1 flex w-full items-center justify-between rounded-md p-1.5 ${
                        activeUserDocument && activeUserDocument!['id'] === item.id
                            ? 'bg-[#ECECEC]'
                            : 'hover:bg-[#ECECEC]'
                    }`}
                >
                    <button
                        className="flex-1 truncate text-left cursor-pointer"
                        onClick={() => {
                            setActiveItem(
                                item,
                                activeUserDocument != undefined &&
                                item['id'] === activeUserDocument['id']
                            );
                        }}
                    >
                        <span className="block truncate">{item['documentName']}</span>
                    </button>
                    <button
                        className="cursor-pointer rounded-lg text-gray-400 opacity-0 transition-opacity hover:bg-gray-300 hover:text-gray-600 group-hover:opacity-100"
                        onClick={ () => { onDeleteChat(item.id) } }
                        data-more-button="true"
                    >
                        <Image className="cursor-pointer" alt="delete chat" height={18} src={DeleteIcon} width={18} />
                    </button>
                </div>
            ))}
        </>
    )
}