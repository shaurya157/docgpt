import { siteConfig } from '@/config/site';
import { MainNav } from '@/components/site/main-nav';
import { ThemeToggle } from '@/components/site/theme-toggle';
import {FilesDropdownMenu} from "@/components/site/files-dropdown-menu";
import UserButton from "@/components/site/user-button";
import {Session} from "next-auth";
import {TemplatesDropdown} from "@/components/site/templates-dropdown";
import {UserGuideButton} from "@/components/site/user-guide-button";
import {DocumentsDropdown} from "@/components/site/documents-dropdown";

interface SiteHeaderProps {
  session: Session | null;
}

export async function SiteHeader({session}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <UserGuideButton />
            { session?.user ? <DocumentsDropdown /> : <div></div>}
            { session?.user ? <TemplatesDropdown /> : <div></div>}
            { session?.user ? <FilesDropdownMenu /> : <div></div>}
            <UserButton session={session} />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
