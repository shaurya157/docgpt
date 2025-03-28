'use client';

import { usePathname } from 'next/navigation';

import PreLoginHeader from './pre-login-header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  if (isLandingPage) {
    return null;
  }
  
  return <PreLoginHeader />;
} 