import {Session} from "next-auth";

import {
    getOwnedTemplates,
    getUserOwnedDocuments,
    getUserIntegrations,
    getUserUploadedFilesData,
} from "@/firebase/firestore-dao";
import {FileInfo} from "@/providers/user-data-provider";

export async function getExistingUserUploadedFiles(session: Session) {
    const result: FileInfo[] = [];

    await getUserUploadedFilesData(session.user!.email!).then((data) => {
        if (data.result != undefined) {
            data.result.forEach((file) => {
                result.push({
                    fileIds: file.fileIds,
                    fileName: file.fileName,
                });
            });
        }
    });

    return result;
}

export async function getTemplates(templateOwnerId: string) {
    const result: any[] = [];
    const userTemplatesSnapshot = await getOwnedTemplates(templateOwnerId);
    userTemplatesSnapshot.docs.forEach((doc) => {
        const res = {
            id: doc.id,
            template: doc.get('template'),
            templateName: doc.get('templateName'),
            templateOwnerId: doc.get('templateOwnerId')
        };

        result.push(res);
    });
    return result;
}

export async function getUserDocs(session: Session) {
    const result: any[] = [];
    const resSnapshot = await getUserOwnedDocuments(session.user!.email!);
    resSnapshot.docs.forEach((doc) => {
        const res = {
            id: doc.id,
            chatId: doc.get('chatId'),
            document: doc.get('document'),
            documentName: doc.get('documentName'),
            threadId: doc.get('threadId')
        };

        result.push(res);
    });
    return result;
}

// New function to get integration status on sign-in
export async function getUserIntegrationStatus(session: Session) {
    if (!session?.user?.email) {
        return null;
    }
    const { integrations } = await getUserIntegrations(session.user.email);
    return integrations;
}
