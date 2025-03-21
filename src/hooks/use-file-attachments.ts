import { useState } from 'react';

import { toast } from 'sonner';

interface FileAttachment {
  file: File;
  fileName: string;
  fileType: string;
  status: string;
  url: string;
}

export const useFileAttachments = (userId: string) => {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const updateAttachments = (files: FileList | null) => {
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        file,
        fileName: file.name,
        fileType: file.type,
        status: 'waiting',
        url: URL.createObjectURL(file),
      }));

      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const changeFileUploadStatus = (attachment: FileAttachment, status: string) => {
    setAttachments((prev) =>
      prev.map((att) =>
        att.url === attachment.url ? { ...att, status } : att
      )
    );
  };

  const uploadFiles = async (chatId: string) => {
    setUploadInProgress(true);
    attachments.forEach((attachment) =>
      changeFileUploadStatus(attachment, 'uploading')
    );
    const fileIds: any[] = [];

    try {
      for (const attachment of attachments) {
        const filesFormData = new FormData();
        filesFormData.append('userId', userId);
        filesFormData.append('chatId', chatId);
        filesFormData.append('files', attachment.file);

        const filesResult = await fetch('/api/ai/files', {
          body: filesFormData,
          method: 'POST',
        });
        const resultJson = await filesResult.json();
        
        if (resultJson.status === 400) {
          throw new Error(resultJson.message);
        }

        const successfulFiles = resultJson.files.filter(
          (file: any) => file.status === 'success'
        );
        if (successfulFiles.length > 0) {
          fileIds.push(...successfulFiles);
        }

        const failedFiles = resultJson.files.filter(
          (file: any) => file.status === 'error'
        );
        if (failedFiles.length > 0) {
          toast.error(
            `Failed to upload some files: ${failedFiles
              .map((f: any) => f.fileName)
              .join(', ')}`
          );
        }
      }
    } catch (e) {
      toast.error(
        `Error uploading files. Please send the following message to the developers: ${e}`
      );
      console.error(`There was an error uploading the files. Error: ${e}.`);
    }

    setAttachments([]);
    setUploadInProgress(false);
    return fileIds;
  };

  return {
    attachments,
    removeAttachment,
    updateAttachments,
    uploadFiles,
    uploadInProgress,
  };
}; 