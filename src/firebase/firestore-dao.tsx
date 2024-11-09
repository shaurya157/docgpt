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

export default async function getData(userid) {
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
