"use server"
import {signIn, signOut} from "../../../auth";

export const signInFn = async () => {
  // TODO: More providers here, need to refactor
  await signIn("google")
}

export const signOutFn = async () => {
  await signOut()
}
