import { FieldValue, getFirestore, doc, updateDoc, setDoc, getDoc, arrayUnion, collection } from "firebase/firestore";
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

export async function getUserActiveAssistantAndVectorIds(userid: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let savedAssistantId;
  let savedVectorStoreId;

  const result = await getDoc(docRef)
  savedAssistantId = result.get("assistantId")
  savedVectorStoreId = result.get("vectorStoreId")

  return { savedAssistantId, savedVectorStoreId };
}

export async function getUserActiveThreadId(userid: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let result;
  let error;

  result = await getDoc(docRef).then(data => data.get("threadId"))

  return { result, error };
}

export async function getUserDocument(userid: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let result;
  let error;

  try {
    result = await getDoc(docRef).then(data => data.get("document"))
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export async function saveCurrentDocumentState(userId: string, document: any) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result, error;

  try {
    const value = {
      "document": document
    }
    result = await setDoc(
      docRef,
      value,
      { merge: true }
    );
  } catch (e) {
    error = e
  }


  return { result, error };
}

export async function saveUserTemplate(userId: string, templateName: string, template: any) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result, error;

  try {
    const value = {
      "templates": arrayUnion({
        "templateName": templateName,
        template
      })
    }
    result = await setDoc(
      docRef,
      value,
      { merge: true }
    );
  } catch (e) {
    error = e
  }

  return { result, error };
}

export async function saveUserActiveAssistant(userId: string, assistantId: string, vectoreStoreId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result;

  result = await setDoc(
    docRef,
    {
      assistantId: assistantId,
      vectorStoreId: vectoreStoreId
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

export async function getDocgptOwnedTemplates() {
  let templatesRef = collection(db, "templates")
  let docRef = doc(templatesRef, "docgpt");
  let result;
  let error;

  try {
    result = await getDoc(docRef).then(data => data.get("templates"))
  } catch (e) {
    error = e
  }

  return { result, error };
}

export async function getUserTemplates(userId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result;
  let error;

  try {
    result = await getDoc(docRef).then(data => data.get("templates"))
  } catch (e) {
    error = e;
  }

  return { result, error };
}
