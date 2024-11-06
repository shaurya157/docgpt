import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import firebase_app from "@/firebase/config";

const db = getFirestore(firebase_app)
export async function addData(colllection, id, data) {
  let result;
  let error;

  try {
    result = await setDoc(doc(db, colllection, id), data, {
      merge: true,
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export default async function getData(collection, id) {
  let docRef = doc(db, collection, id);
  let result;
  let error;

  try {
    result = await getDoc(docRef);
  } catch (e) {
    error = e;
  }

  return { result, error };
}
