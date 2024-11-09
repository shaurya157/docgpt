import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/plate-ui/button';
import { MainNav } from '@/components/site/main-nav';
import { ThemeToggle } from '@/components/site/theme-toggle';
import {FilesDropdownMenu} from "@/components/site/files-dropdown-menu";
import UserButton from "@/components/site/user-button";
import {auth} from "../../../auth";
import getData from "@/firebase/firestore-dao";
import {collection, getFirestore} from "firebase/firestore";
import firebase_app from "@/firebase/config";

export async function SiteHeader() {
  const session = await auth()
  let userFilesData: Array<Map<string, string>> = []
  if (session) {
    await getData(session.user?.email).then((data) => {
      userFilesData = data.result
    })

    console.log(userFilesData)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <UserButton session={session} />
            <FilesDropdownMenu session={session} userFilesData={userFilesData}/>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
