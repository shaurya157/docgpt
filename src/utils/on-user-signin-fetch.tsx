import {Session} from "next-auth";

import {
    getOwnedTemplates,
    getUserOwnedDocuments,
    getUserUploadedFilesData,
} from "@/firebase/firestore-dao";
import {FileInfo} from "@/providers/user-data-provider";

export async function getExistingUserUploadedFiles(session: Session) {
    const result: FileInfo[] = [];

    await getUserUploadedFilesData(session.user!.email!).then((data) => {
        if (data.result != undefined) {
            data.result.forEach((file) => {
                result.push({
                    fileName: file.fileName,
                    fileIds: file.fileIds,
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
            document: doc.get('document'),
            documentName: doc.get('documentName'),
            threadId: doc.get('threadId'),
            chatId: doc.get('chatId')
        };

        result.push(res);
    });
    return result;
}
