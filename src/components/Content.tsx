import { useState, useRef, useEffect } from "react";
import { MenuItem } from "@/types";
import Image from "next/image";
import { motion } from "framer-motion";

import AttachmentIcon from "../assets/icons/attachment.svg";
import UploadIcon from "../assets/icons/arrowUp.svg";
import CloseIcon from "../assets/icons/x.svg";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  attachments?: Array<{
    url: string;
    fileName: string;
    fileType: string;
  }>;
}

interface ContentProps {
  items: MenuItem[];
  activeItem: string;
}

const Content = ({ items, activeItem }: ContentProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hi, how can I help you today? You can press /help to learn about everything I can do for you.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [attachments, setAttachments] = useState<
    Array<{
      url: string;
      fileName: string;
      fileType: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() || attachments.length > 0) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: inputValue.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      setMessages((prev) => [...prev, newMessage]);

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content:
            "I'm DocGPT, and I've received your message. How can I assist you further?",
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 1000);

      setInputValue("");
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];

      const newAttachments = Array.from(files)
        .filter((file) => allowedTypes.includes(file.type))
        .map((file) => ({
          url: URL.createObjectURL(file),
          fileName: file.name,
          fileType: file.type,
        }));

      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col h-full p-4"
      transition={{
        duration: 0.2,
        type: "spring",
        damping: 20,
        stiffness: 100,
      }}
    >
      <div className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-xl py-2 px-4 ${
                  message.type === "user" ? "bg-gray-200 text-black" : ""
                }`}
              >
                {message.type !== "user" ? (
                  <div className="whitespace-pre-wrap">
                    <span className="font-semibold">DocGPT:</span>{" "}
                    {message.content}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                {message.attachments && (
                  <div className="mt-2 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 pb-2">
                      {message.attachments.map((attachment, index) =>
                        attachment.fileType.startsWith("image/") ? (
                          <img
                            key={index}
                            src={attachment.url}
                            alt={attachment.fileName}
                            className="w-48 h-32 object-cover border rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div
                            key={index}
                            className="w-48 h-32 flex items-center justify-center border rounded-lg bg-gray-50"
                          >
                            <span className="text-sm text-gray-500">
                              PDF: {attachment.fileName}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="w-full max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white p-2">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="bg-gray-200 rounded-lg px-3 py-1 flex items-center gap-1.5"
              >
                <span className="text-gray-700">{attachment.fileName}</span>
                <button
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Image src={CloseIcon} alt="close" width={16} height={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <Image src={AttachmentIcon} alt="Attach" width={20} height={20} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a comment"
            className="flex-1 p-1 text-gray-600 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue}
            className={`p-2 rounded-full ${
              inputValue
                ? "bg-black cursor-pointer"
                : "bg-gray-200 cursor-not-allowed"
            }`}
          >
            <Image src={UploadIcon} alt="Send" width={18} height={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Content;
