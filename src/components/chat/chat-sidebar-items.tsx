import Image from "next/image";

import DeleteIcon from "@/assets/icons/delete.svg";
import { useDocument } from "@/providers/document-provider";

interface ChatSidebarItemsProps {
    items: any[] | null | undefined;
    onDeleteChat: (chatId: string) => void;
    setActiveItem: (id: any, documentRefreshOnly: boolean) => void;
}

export const ChatSidebarItems = ({items, setActiveItem, onDeleteChat}: ChatSidebarItemsProps) => {
    const { activeUserDocument } = useDocument();
    
    return (
        <>
            {items?.map((chat, idx) => (
                <div
                    key={idx}
                    className={`cursor-pointer group mb-1 flex w-full items-center justify-between rounded-md p-1.5 ${
                        activeUserDocument && chat.documentIds[0] === activeUserDocument['id']
                            ? 'bg-[#ECECEC]'
                            : 'hover:bg-[#ECECEC]'
                    }`}
                    onClick={() => {
                        setActiveItem(
                          chat,
                          activeUserDocument != undefined &&
                          chat.documentIds[0] === activeUserDocument['id']
                        );
                    }}
                >
                    <button
                        className="flex-1 truncate text-left cursor-pointer"
                    >
                        <span className="block truncate">{chat.chatName}</span>
                    </button>
                    <button
                        className="cursor-pointer rounded-lg text-gray-400 opacity-0 transition-opacity hover:bg-gray-300 hover:text-gray-600 group-hover:opacity-100"
                        onClick={ () => { onDeleteChat(chat.id) } }
                        data-more-button="true"
                    >
                        <Image className="cursor-pointer" alt="delete chat" height={18} src={DeleteIcon} width={18} />
                    </button>
                </div>
            ))}
        </>
    )
}