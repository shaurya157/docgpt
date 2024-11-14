import { FieldValue, getFirestore, doc, updateDoc, setDoc, getDoc, arrayUnion, collection } from "firebase/firestore";
import firebase_app from "@/firebase/config";

const db = getFirestore(firebase_app)
export async function appendFileDataToUser(userid, data: Map<string, string>) {
  let result;
  let error;

  const userRef = collection(db, "users")
  const value = {
    "files": arrayUnion({
      "fileName": data.get("fileName"),
      "openAiFileId": data.get("openAiFileId")
    })
  }

  try {
    result = await setDoc(
      doc(userRef, userid),
      value,
      { merge: true }
    );
  } catch (e) {
    error = e;
  }

  return { result, error };
}

// TODO: refactor below 3 methods into a single method which accepts different params
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

export async function getUserActiveAssistantId(userid: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let result;
  let error;

  try {
    result = await getDoc(docRef).then(data => data.get("assistantId"))
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export async function getUserActiveThreadId(userid: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let result;
  let error;

  try {
    result = await getDoc(docRef).then(data => data.get("threadId"))
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export async function setUserAssistant(userid: string, assistantId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let result;

  console.log(`Starting save to firestore for ${userid} with ${assistantId} `);
  result = await setDoc(docRef, {
    assistantId: assistantId
  }, {
    merge: true,
  });

  return { result };
}

export async function saveUserActiveAssistant(userId: string, assistantId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result;
  let error;

  result = await setDoc(docRef, {
    assistantId: assistantId
  }, {
    merge: true,
  });

  return { result };
}

export async function saveUserActiveThread(userId: string, threadId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result;
  let error;

  result = await setDoc(docRef, {
    threadId: threadId
  }, {
    merge: true,
  });

  return { result };
}
