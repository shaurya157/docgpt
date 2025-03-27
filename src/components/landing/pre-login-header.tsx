import Link from 'next/link';

import {SignIn} from "@/components/landing/auth";
import { Button } from '@/components/plate-ui/button';

export default function PreLoginHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link className="flex items-center space-x-2" href="/">
            <span className="font-bold text-xl">DocGPT</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link className="text-sm font-medium transition-colors hover:text-primary" href="/">
            Home
          </Link>
          <Link className="text-sm font-medium transition-colors hover:text-primary" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium transition-colors hover:text-primary" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium transition-colors hover:text-primary" href="/contact">
            Contact
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <SignIn variant="ghost" className="hidden md:flex" displayText="Sign In" />
          <SignIn className="bg-primary text-primary-foreground hover:bg-primary/90" displayText="Try for free" />
          
          {/* Mobile menu button */}
          <Button variant="ghost" className="md:hidden p-0 w-10 h-10">
            <svg
              className="h-6 w-6"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
