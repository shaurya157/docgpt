import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  addDoc,
  where
} from "firebase/firestore";
import firebase_app from "@/firebase/config";

const db = getFirestore(firebase_app)
export async function appendFileDataToUser(userId: string, data: Map<string, string>) {
  let result;
  let error;

  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId)

  const value = {
    "files": arrayUnion({
      "fileName": data.get("fileName"),
      "openAiFileId": data.get("openAiFileId")
    })
  }
  try {
    result = await setDoc(
      docRef,
      value,
      { merge: true }
    );
  } catch (e) {
    error = e;
  }

  return { result, error };
}


export async function appendDocumentSpecificFileIds(documentId: string, files: Map<string, string>[]) {
  let result: any[] = [];
  let error: Error[] = [];

  console.log(files)
  console.log("documentId", documentId)
  let documentsRef = collection(db, "documents")
  let docRef = doc(documentsRef, documentId)

  for (const file of files) {
    const value = {
      "files": arrayUnion({
        "fileName": file["fileName"],
        "openAiFileId": file["openAiFileId"]
      })
    }

    try {
      result.push(await setDoc(
        docRef,
        value,
        { merge: true }
      ))
    } catch (e) {
      error.push(e)
    }
  }

  return { result, error };
}

// TODO: refactor below 4 methods into a single method which accepts different params
export async function getUserUploadedFilesData(userid: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let result;
  let error;

  try {
    result = await getDoc(docRef).then(data => data.get("files"))
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export async function getUserInfo(userid: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let savedAssistantId;
  let savedVectorStoreId;
  let savedOpenAiChatAssistantId;
  let savedActiveDocumentName;

  const result = await getDoc(docRef)
  savedAssistantId = result.get("assistantId")
  savedVectorStoreId = result.get("vectorStoreId")
  savedOpenAiChatAssistantId = result.get("openAiChatAssistantId")
  savedActiveDocumentName = result.get("activeDocumentName")
  return { savedAssistantId, savedVectorStoreId, savedOpenAiChatAssistantId, savedActiveDocumentName };
}

export async function getUserActiveThreadId(userid: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let result;
  let error;

  result = await getDoc(docRef).then(data => data.get("threadId"))

  return { result, error };
}

export async function getUserOwnedDocuments(userId: string) {
  return await getDocs(query(collection(db, "documents"), where("documentOwnerId", "==", userId)))
}

export async function saveCurrentDocumentState(userId: string, documentName: string, threadId: string, documentVectorStoreId: string, document: any, documentId?: string) {
  console.log(documentVectorStoreId)
  let documentsRef = collection(db, "documents")
  let result, error;
  try {
    const value = {
      "documentOwnerId": userId,
      "document": document,
      "threadId": threadId,
      "documentName": documentName,
      "vectorStoreId": documentVectorStoreId
    }

    result = documentId ? await setDoc(
      doc(documentsRef, documentId),
      value,
      { merge: true }
    ) : await addDoc(documentsRef, value)
  } catch (e) {
    error = e
  }

  return { result, error };
}

export async function saveUserTemplate(userId: string, templateName: string, template: any, isTemplateOwner: boolean, templateId?: string) {
  let templatesRef = collection(db, "templates")
  let result, error;

  try {
    const value = {
      "templateOwnerId": userId,
      "template": template,
      "templateName": templateName
    }

    result = templateId && isTemplateOwner ? await setDoc(
      doc(templatesRef, templateId),
      value,
      { merge: true }
    ) : await addDoc(templatesRef, value)
  } catch (e) {
    error = e
  }

  return { result, error };
}

export async function saveUserActiveAssistant(userId: string, assistantId: string, vectoreStoreId: string, openAiChatAssistantId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result;

  result = await setDoc(
    docRef,
    {
      assistantId: assistantId,
      vectorStoreId: vectoreStoreId,
      openAiChatAssistantId: openAiChatAssistantId
    },
    { merge: true,}
  );

  return { result };
}

export async function saveUserActiveThread(userId: string, threadId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result;

  result = await setDoc(docRef, {
    threadId: threadId
  }, {
    merge: true,
  });

  return { result };
}

export async function getOwnedTemplates(templateOwnerId: string) {
  return await getDocs(query(collection(db, "templates"), where("templateOwnerId", "==", templateOwnerId)))
}

export async function deleteUserUploadedFile(userId: string, fileName: string, openAiFileId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result, error;

  const value = {
    "files": arrayRemove({
      "fileName": fileName,
      "openAiFileId": openAiFileId
    })
  }

  try {
    result = await setDoc(
      docRef,
      value,
      { merge: true }
    );
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export async function setActiveUserDoc(userId: string, documentName: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result;
  let error;

  try {
    result = await setDoc(
      docRef,
      { activeDocumentName: documentName },
      { merge: true,}
    );
  } catch (e) {
    error = e
  }

  return { result, error };
}
