import Link from 'next/link';

import { siteConfig } from '@/config/site';
import PlateEditor from '@/components/plate-editor';
import { buttonVariants } from '@/components/plate-ui/button';
import {SessionProvider} from "next-auth/react";
import {auth} from "../../auth";
import {
  getUserActiveAssistantId,
  getUserActiveThreadId,
  saveUserActiveAssistant,
  saveUserActiveThread
} from "@/firebase/firestore-dao";
import {Session} from "next-auth";
import UserDataProvider from "@/providers/UserDataProvider";

async function createAssistantIfNotExist(session: Session) {
  let assistantId;
  // TODO: this is very inelegant. We are making the call in the site header/page and then passing all the children the user uploaded files.
  // I've done this due to a lack of knowledge about how to make server side callbacks when a user signs in. This is also potentially running multiple times...
  // Ideally, when the user signs in, we should:
  // 1) Get all user data
  // 2) Check if there is an active assistant + thread
  // 3) If not, create a new assistant + thread + save to DB
  // All 3 should be done as a callback. If we do this, the user needs to refresh the page to see any details which isn't ideal.
  // The same is done on layout.tsx, once refactor make the same change there
  // Maybe we can use useEffect() here?
  try {
    const fireBaseResult =  await getUserActiveAssistantId(session.user?.email!)

    if (fireBaseResult.result != undefined) {
      assistantId = fireBaseResult.result
    } else {
      let userId = session.user?.email!
      // TODO: idk why we need to use a environment variable to do a fetch specifically here but we do...
      // Find a better way
      const createAssistantResult = await fetch(process.env.NEXTAUTH_URL + '/api/ai/assistant/create', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      })
      const responseJson = await createAssistantResult.json()
      assistantId = responseJson["assistantId"]

      // TODO: Move this to the server, no need for this to happen here, potentially unsafe
      await saveUserActiveAssistant(userId, assistantId)
    }
  } catch (error) {
    console.error(error)
  }

  return assistantId;
}

async function createThreadIfNotExist(session: Session) {
  let threadId;
  // TODO: same as above
  try {
    const fireBaseResult =  await getUserActiveThreadId(session.user?.email!)

    if (fireBaseResult.result != undefined) {
      threadId = fireBaseResult.result
    } else {
      let userId = session.user?.email!
      // TODO: idk why we need to use a environment variable to do a fetch specifically here but we do...
      // Find a better way
      const createThreadResult = await fetch(process.env.NEXTAUTH_URL + '/api/ai/thread/create', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      })
      const responseJson = await createThreadResult.json()
      threadId = responseJson["threadId"]

      await saveUserActiveThread(userId, threadId)
    }
  } catch (error) {
    console.error(error)
  }

  return threadId;
}

export default async function IndexPage() {
  const session = await auth()
  let assistantId, threadId
  if (session) {
    assistantId = await createAssistantIfNotExist(session)
    threadId = await createThreadIfNotExist(session)
  }

  return (
      <section className="container grid items-center gap-6 px-4 pb-8 pt-6 sm:px-8 md:py-10">
        <div
          className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
          <SessionProvider session={session}>
            <UserDataProvider assistantId={assistantId} threadId={threadId}>
              <PlateEditor/>
            </UserDataProvider>
          </SessionProvider>
        </div>
      </section>
  );
}
