'use client';

import Link from 'next/link';
import { useState } from 'react';

import {SignIn} from "@/components/landing/auth";
import { Button } from '@/components/plate-ui/button';

export default function PreLoginHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-gradient-to-r from-white via-white to-blue-50/30 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-20 items-center justify-between px-6 md:px-16 max-w-[1400px] mx-auto">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link className="flex items-center space-x-2 group" href="/">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">D</div>
            <span className="font-bold text-xl tracking-tight group-hover:text-blue-600 transition-colors">DocGPT</span>
          </Link>
        </div>
        
        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Right: Auth buttons & Mobile Toggle */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Desktop Buttons */}
          <SignIn 
            className="hidden md:flex bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg px-5 py-2.5 text-[15px] transition-all duration-300 shadow-sm hover:shadow-blue-100/50 hover:shadow-lg" 
            displayText="Try for free" 
          />
          <SignIn 
            variant="ghost" 
            className="hidden md:flex text-gray-700 hover:text-blue-600 font-medium text-[15px] px-4 transition-colors" 
            displayText="Sign In" 
          />
          <Link 
            href="/contact" 
            className="hidden md:flex text-gray-700 hover:text-blue-600 font-medium text-[15px] px-4 py-2.5 transition-colors"
          >
            Contact
          </Link>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            className="md:hidden p-0 w-10 h-10 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg"
            onClick={toggleMobileMenu}
          >
            {/* Hamburger/Close Icon based on state */}
            {isMobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg py-4 px-6 border-t border-gray-100">
          <nav className="flex flex-col gap-4">
            <SignIn 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg px-5 py-2.5 text-[15px] transition-all duration-300 shadow-sm hover:shadow-blue-100/50 hover:shadow-lg flex justify-center" 
              displayText="Try for free" 
            />
            <SignIn 
              variant="outline" 
              className="w-full text-gray-700 hover:text-blue-600 hover:border-blue-300 font-medium text-[15px] px-4 py-2.5 transition-colors flex justify-center border-gray-300" 
              displayText="Sign In" 
            />
            <Link 
              href="/contact" 
              className="w-full text-center text-gray-700 hover:text-blue-600 font-medium text-[15px] px-4 py-2.5 transition-colors rounded-lg hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
