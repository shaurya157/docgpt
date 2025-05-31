'use client';

import React from 'react';

import { signIn } from 'next-auth/react';
import Link from 'next/link';


export default function SignInPage() {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/home' });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="absolute top-8 left-8">
        <Link className="flex items-center space-x-2 group" href="/">
          <div className="w-12 h-12 bg-[#2563EB] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">D</div>
          <span className="font-bold text-xl tracking-tight text-gray-900">DocGPT</span>
        </Link>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">Sign in options</h1>
        <button 
          className="flex items-center justify-center gap-3 w-full py-6 text-lg border-2 rounded-lg border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 active:scale-[0.99] transition-all duration-150 cursor-pointer shadow-sm hover:shadow active:shadow-inner"
          onClick={handleGoogleSignIn}
        >
          <svg className="size-6" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
} 