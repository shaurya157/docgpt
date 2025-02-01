'use client';

import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Landing() {
  const { data: session } = useSession();

  if (session?.user) {
    return redirect('/home');
  }

  return <div className="flex h-screen flex-col"></div>;
}
