import {Session} from "next-auth";

import {
    getAssistants,
    getOwnedTemplates,
    getUserInfo, getUserOwnedDocuments,
    getUserUploadedFilesData,
    saveUserActiveAssistant
} from "@/firebase/firestore-dao";
import {FileInfo} from "@/providers/user-data-provider";

export async function createAssistantIfNotExist(session: Session) {
    let openAiAssistantId;
    let openAiVectorStoreId;
    let openAiChatAssistantId;
    // TODO: this is very inelegant. We are making the call in the site header/page and then passing all the children the user uploaded files.
    // I've done this due to a lack of knowledge about how to make server side callbacks when a user signs in. This is also potentially running multiple times...
    // Ideally, when the user signs in, we should:
    // 1) Get all user data
    // 2) Check if there is an active assistant + thread
    // 3) If not, create a new assistant + thread + save to DB
    // All 3 should be done as a callback. If we do this, the user needs to refresh the page to see any details which isn't ideal.
    // The same is done on layout.tsx, once refactor make the same change there
    // Maybe we can use useEffect() here?
    const { savedAssistantId, savedOpenAiChatAssistantId, savedVectorStoreId } =
        await getUserInfo(session.user!.email!);
    if (savedAssistantId && savedVectorStoreId && savedOpenAiChatAssistantId) {
        openAiAssistantId = savedAssistantId;
        openAiVectorStoreId = savedVectorStoreId;
        openAiChatAssistantId = savedOpenAiChatAssistantId;
    } else {
        const userId = session.user!.email!;
        // TODO: idk why we need to use a environment variable to do a fetch specifically here but we do...
        // Find a better way
        const createAssistantResult = await fetch(
            process.env.NEXTAUTH_URL + '/api/ai/assistant/create',
            {
                body: JSON.stringify({ userId }),
                method: 'POST',
            }
        );
        const responseJson = await createAssistantResult.json();
        openAiAssistantId = responseJson['assistantId'];
        openAiVectorStoreId = responseJson['vectorStoreId'];
        openAiChatAssistantId = responseJson['chatAssistantId'];

        // TODO: Move this to the server, no need for this to happen here, potentially unsafe
        await saveUserActiveAssistant(
            userId,
            openAiAssistantId,
            openAiVectorStoreId,
            openAiChatAssistantId
        );
    }

    return {
        openAiAssistantId,
        openAiChatAssistantId,
        openAiVectorStoreId,
    };
}

export async function getExistingUserUploadedFiles(session: Session) {
    const result: FileInfo[] = [];

    await getUserUploadedFilesData(session.user!.email!).then((data) => {
        if (data.result != undefined) {
            data.result.forEach((file) => {
                result.push({
                    fileName: file.fileName,
                    openAiFileId: file.openAiFileId,
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
            files: doc.get("files"),
            threadId: doc.get('threadId'),
            vectorStoreId: doc.get('vectorStoreId')
        };

        result.push(res);
    });
    return result;
}

export async function getAssistantDefinitions(assistantOwnerId) {
    const result: any[] = [];
    const assistantDefinitionsSnapshot = await getAssistants(assistantOwnerId);
    assistantDefinitionsSnapshot.docs.forEach((doc) => {
        const res = {
            id: doc.id,
            goals: doc.get('goals'),
            name: doc.get('name'),
            ownerId: doc.get('ownerId'),
            role: doc.get('role'),
            rules: doc.get('rules'),
        };

        result.push(res);
    });

    return result;
}

export async function getUserDefinedAssistants(userId: string) {
    const result: any[] = [];
    const assistantsSnapshot = await getAssistants(userId);
    assistantsSnapshot.docs.forEach((doc) => {
        const res = {
            id: doc.id,
            name: doc.get('name'),
            description: doc.get('description'),
            role: doc.get('role'),
            goals: doc.get('goals'),
            rules: doc.get('rules'),
            ownerId: doc.get('ownerId')
        };
        result.push(res);
    });
    return result;
}

