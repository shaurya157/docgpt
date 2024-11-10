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

export async function getAllUserData(userid: string) {
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



export async function setUserAssistant(userid: string, assistantId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userid);
  let result;
  let error;

  try {
    result = await setDoc(docRef, {
      assistantId: assistantId
    }, {
      merge: true,
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export async function setUserActiveThread(userId: string, threadId: string) {
  let usersRef = collection(db, "users")
  let docRef = doc(usersRef, userId);
  let result;
  let error;

  try {
    result = await setDoc(docRef, {
      threadId: threadId
    }, {
      merge: true,
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}
