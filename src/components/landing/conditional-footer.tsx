'use client';

import { usePathname } from 'next/navigation';

import PreLoginFooter from './pre-login-footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  if (isLandingPage) {
    return null;
  }
  
  return <PreLoginFooter />;
} 