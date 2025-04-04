import { Message } from '@/types';

interface ParsedDocument {
  appending: string;
  document: string;
  documentTitle: string;
  prepending: string;
}

export const extractTitleFromDocument = (document: string): string => {
  const titleRegex = /^(#{1,6})\s+(.*)/m;
  const match = document.match(titleRegex);
  return match ? match[2].trim().replaceAll("*", "") : 'New Document';
};

export const parseAssistantResponse = (message: Message): ParsedDocument => {
  const startTag = '<Document>';
  const endTag = '</Document>';
  const startIndex = message.content.indexOf(startTag);
  const endIndex = message.content.indexOf(endTag);

  const prepending = message.content.slice(0, startIndex);
  
  // If no end tag is found, everything after start tag is the document
  const document = endIndex === -1 
    ? message.content.slice(startIndex + startTag.length).trim()
    : message.content.slice(startIndex + startTag.length, endIndex).trim();
    
  const documentTitle = extractTitleFromDocument(document);
  
  // Only have appending text if end tag was found
  const appending = endIndex === -1 
    ? '' 
    : message.content.slice(endIndex + endTag.length);

  return {
    appending,
    document,
    documentTitle,
    prepending,
  };
}; 