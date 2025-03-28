'use client';

import { useState, useEffect } from 'react';

import { ChevronRight, Play, ArrowRight, Star, CheckCircle2, Zap } from "lucide-react";
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from "@/components/plate-ui/button";

export default function Landing() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  if (session?.user) {
    return redirect('/home');
  }

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      {/* Apple-style Navigation - with subtle animation on scroll */}
      <nav className={`w-full bg-white/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md shadow-blue-100/50' : ''}`}>
        <div className="max-w-[1066px] mx-auto px-4 h-12 flex items-center justify-between">
          <div className="text-xl font-semibold text-blue-600">DocGPT</div>
          <div className="hidden md:flex text-sm text-gray-600 space-x-8">
            <Link href="/overview" className="hover:text-blue-600 transition-colors">Overview</Link>
            <Link href="/features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="/support" className="hover:text-blue-600 transition-colors">Support</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
              Sign in
            </Link>
            <Link href="/trial" className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full transition-colors">
              Try for free
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full flex flex-col items-center bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero Section - Text on left, image on right */}
        <section className="w-full py-[40px] md:py-[80px] bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-purple-300/20 to-pink-300/20 blur-3xl"></div>
            <div className="absolute bottom-[10%] left-[5%] w-[250px] h-[250px] rounded-full bg-gradient-to-r from-orange-300/20 to-pink-300/20 blur-3xl"></div>
          </div>
          <div className="relative max-w-[1066px] mx-auto px-4 z-10">
            <div className="flex flex-col items-center">
              {/* Text content */}
              <div className="w-full text-center md:text-left mb-12">
                <h1 className="text-[36px] md:text-[56px] lg:text-[64px] font-bold tracking-tight text-[#1d1d1f] mb-4 md:mb-6 leading-[1.1]">
                  Specialized AI to write your business documents
                </h1>
                <p className="text-[17px] md:text-[21px] text-[#494949] leading-[1.47] font-normal mb-4 mx-auto md:mx-0 md:max-w-[80%]">
                  DocGPT is a document editor that lets you create polished and contextual business documents by prompting our AI writing agents with content from your everyday business tools. 
                </p>

                <div className="mt-[20px] md:mt-[24px] flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href="/trial" className="text-center text-[17px] text-white bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full transition-all duration-300 font-medium inline-flex items-center justify-center shadow-lg hover:shadow-xl">
                    Try for free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/demo" className="text-center text-[17px] text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50/50 backdrop-blur-sm border border-blue-200 px-8 py-4 rounded-full transition-colors font-medium inline-flex items-center justify-center">
                    Request a demo
                  </Link>
                </div>

                {/* Trust signals */}
                <div className="mt-8 text-sm text-[#86868b] text-center md:text-left">
                  <p>No credit card required • 14-day free trial • Cancel anytime</p>
                </div>
              </div>
              
              {/* Image container */}
              <div className="w-full max-w-[1200px] mx-auto">
                <div className="relative w-full h-[400px] md:h-[500px]">
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/60 backdrop-blur-sm rounded-[12px] border border-white/30"></div>
                  <img 
                    src="https://placehold.co/1200x675/f5f5f7/e0e0e0?text=Document+Editor+Interface" 
                    alt="DocGPT document editor interface" 
                    className="w-full h-full object-contain md:object-cover rounded-[12px] border border-white/30 shadow-2xl"
                  />
                  {/* Floating gradient elements for visual interest */}
                  <div className="absolute -top-6 -left-6 w-48 h-48 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 blur-3xl opacity-20"></div>
                  <div className="absolute -bottom-10 right-24 w-64 h-64 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 blur-3xl opacity-20"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logos section */}
        <section className="w-full py-10 bg-white/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[20%] left-[10%] w-[200px] h-[200px] rounded-full bg-gradient-to-r from-blue-300/10 to-purple-300/10 blur-3xl"></div>
          </div>
          <div className="max-w-[1066px] mx-auto px-4 relative z-10">
            <p className="text-center text-[#86868b] font-medium mb-8 text-sm uppercase tracking-wider">Used by employees at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-80">
              <div className="w-[120px] h-[45px] flex items-center justify-center">
                <svg viewBox="0 0 120 36" className="w-full h-full">
                  <path d="M72.2,17.9c-3.5,2.6-8.5,4-12.9,4c-6.1,0-11.6-2.3-15.8-6c-0.3-0.3-0.1-0.7,0.4-0.5c4.5,2.6,10.1,4.2,15.9,4.2c3.9,0,8.2-0.8,12.1-2.5C72.6,16.7,72.9,17.5,72.2,17.9z M74.1,15.7c-0.4-0.6-2.9-0.3-4-0.1c-0.3,0-0.4-0.3-0.1-0.5c2-1.4,5.2-1,5.6-0.5c0.4,0.5-0.1,3.7-1.9,5.3c-0.3,0.2-0.6,0.1-0.4-0.2C73.9,18.6,74.6,16.3,74.1,15.7z M66.9,5.8v-1.4c0-0.2,0.2-0.4,0.4-0.4h7.4c0.2,0,0.4,0.2,0.4,0.4v1.2c0,0.2-0.2,0.5-0.5,1l-3.8,5.5c1.4-0.1,2.9,0.2,4.2,1c0.3,0.2,0.3,0.5,0.1,0.7l-1.3,1.6c-0.2,0.3-0.6,0.3-0.9,0.1c-1.3-1.1-2.9-1.3-4.3-0.6c-0.2,0.1-0.5,0-0.5-0.2v-1.7c0-0.3,0-0.7,0.3-1.2l4.4-6.3h-3.8c-0.2,0-0.4-0.2-0.4-0.4V5.8z M35.7,21.2h-2.3c-0.2,0-0.4-0.2-0.4-0.4V5.7c0-0.2,0.2-0.4,0.4-0.4h2.1c0.2,0,0.4,0.2,0.4,0.4v2c0,0,1.6-2.9,4.8-2.9c2.3,0,4.7,0.8,6.2,3.2c0.1,0.2,0.1,0.4-0.1,0.5l-2.3,1.9c-0.2,0.1-0.5,0.1-0.6-0.1c-0.9-1.1-1.9-1.6-3.3-1.6c-1.9,0-3.5,1.1-3.5,4.2v8c0,0.2-0.2,0.4-0.4,0.4H35.7z M16.4,14.1c0-2.3,1.8-4.1,4-4.1c2.2,0,4,1.8,4,4.1s-1.8,4.1-4,4.1C18.2,18.2,16.4,16.4,16.4,14.1z M24.4,14.1c0-2.3,1.8-4.1,4-4.1c2.2,0,4,1.8,4,4.1s-1.8,4.1-4,4.1C26.2,18.2,24.4,16.4,24.4,14.1z M32.3,14.1c0-2.3,1.8-4.1,4-4.1c2.2,0,4,1.8,4,4.1s-1.8,4.1-4,4.1C34.1,18.2,32.3,16.4,32.3,14.1z" fill="#FF9900"/>
                </svg>
              </div>
              <div className="w-[120px] h-[45px] flex items-center justify-center">
                <svg viewBox="0 0 120 36" className="w-full h-full">
                  <path d="M48.7,14.1c-3.5,0-6.4,2.6-6.4,6.2s2.9,6.2,6.4,6.2c3.5,0,6.4-2.6,6.4-6.2S52.3,14.1,48.7,14.1z M48.7,24c-1.8,0-3.4-1.5-3.4-3.7s1.6-3.7,3.4-3.7c1.8,0,3.4,1.5,3.4,3.7S50.6,24,48.7,24z M35.7,14.1c-3.5,0-6.4,2.6-6.4,6.2s2.9,6.2,6.4,6.2c3.5,0,6.4-2.6,6.4-6.2S39.3,14.1,35.7,14.1z M35.7,24c-1.8,0-3.4-1.5-3.4-3.7s1.6-3.7,3.4-3.7c1.8,0,3.4,1.5,3.4,3.7S37.6,24,35.7,24z M20.6,16.2v2.6h6.3c-0.2,1.5-0.7,2.6-1.5,3.3c-0.9,0.9-2.4,2-4.8,2c-3.9,0-6.9-3.1-6.9-7s3-7,6.9-7c2.1,0,3.6,0.8,4.7,1.9l1.9-1.9c-1.6-1.5-3.6-2.6-6.6-2.6c-5.3,0-9.9,4.3-9.9,9.6s4.5,9.6,9.9,9.6c2.9,0,5.1-0.9,6.8-2.7c1.8-1.8,2.3-4.2,2.3-6.2c0-0.6-0.1-1.2-0.2-1.7L20.6,16.2z M89.6,18.5c-0.5-1.4-2.1-3.9-5.3-3.9c-3.2,0-5.8,2.5-5.8,6.2c0,3.5,2.6,6.2,6.1,6.2c2.8,0,4.5-1.7,5.1-2.7l-2.1-1.4c-0.7,1-1.7,1.7-3,1.7c-1.4,0-2.3-0.6-3-1.9l8.2-3.4L89.6,18.5z M81.2,20.6c-0.1-2.4,1.9-3.6,3.3-3.6c1.1,0,2,0.5,2.3,1.3L81.2,20.6z M79.7,14.8h3v10.9h-3V14.8z M76.9,12.4h-0.1c-0.8-0.9-2.2-1.7-4-1.7c-3.8,0-7.3,3.3-7.3,7.6c0,4.2,3.5,7.5,7.3,7.5c1.8,0,3.2-0.8,4-1.7h0.1v1.1c0,2.9-1.6,4.5-4.1,4.5c-2,0-3.3-1.5-3.8-2.7l-2.9,1.2c0.8,2,3,4.4,6.7,4.4c3.9,0,7.1-2.3,7.1-7.8V14.8h-3V12.4z M73,24c-1.8,0-3.4-1.5-3.4-3.7c0-2.2,1.5-3.7,3.4-3.7c1.8,0,3.2,1.5,3.2,3.7C76.2,22.5,74.8,24,73,24z M96.1,5.9h3v19.8h-3V5.9z M102.8,20.3c-0.8,0-1.4-0.4-1.8-1.2l4.9-2l-0.2-0.4c-0.3-0.9-1.3-2.5-3.4-2.5c-2,0-3.7,1.6-3.7,3.9c0,2.2,1.7,3.9,3.9,3.9c1.8,0,2.9-1.1,3.3-1.7l-1.4-0.9C104,20,103.5,20.3,102.8,20.3z M102.5,16.4c0.7,0,1.3,0.4,1.5,0.8l-3.5,1.5C100.4,17.3,101.5,16.4,102.5,16.4z" fill="#4285F4"/>
                  <path d="M48.7,14.1c-3.5,0-6.4,2.6-6.4,6.2s2.9,6.2,6.4,6.2c3.5,0,6.4-2.6,6.4-6.2S52.3,14.1,48.7,14.1z M48.7,24c-1.8,0-3.4-1.5-3.4-3.7s1.6-3.7,3.4-3.7c1.8,0,3.4,1.5,3.4,3.7S50.6,24,48.7,24z" fill="#EA4335"/>
                  <path d="M35.7,14.1c-3.5,0-6.4,2.6-6.4,6.2s2.9,6.2,6.4,6.2c3.5,0,6.4-2.6,6.4-6.2S39.3,14.1,35.7,14.1z M35.7,24c-1.8,0-3.4-1.5-3.4-3.7s1.6-3.7,3.4-3.7c1.8,0,3.4,1.5,3.4,3.7S37.6,24,35.7,24z" fill="#FBBC05"/>
                  <path d="M20.6,16.2v2.6h6.3c-0.2,1.5-0.7,2.6-1.5,3.3c-0.9,0.9-2.4,2-4.8,2c-3.9,0-6.9-3.1-6.9-7s3-7,6.9-7c2.1,0,3.6,0.8,4.7,1.9l1.9-1.9c-1.6-1.5-3.6-2.6-6.6-2.6c-5.3,0-9.9,4.3-9.9,9.6s4.5,9.6,9.9,9.6c2.9,0,5.1-0.9,6.8-2.7c1.8-1.8,2.3-4.2,2.3-6.2c0-0.6-0.1-1.2-0.2-1.7L20.6,16.2z" fill="#4285F4"/>
                </svg>
              </div>
              <div className="w-[120px] h-[45px] flex items-center justify-center">
                <svg viewBox="0 0 120 36" className="w-full h-full">
                  <path d="M109.8,18c0-9.7-7.9-17.5-17.5-17.5H27.8c-9.7,0-17.5,7.9-17.5,17.5s7.9,17.5,17.5,17.5h64.4C101.9,35.6,109.8,27.7,109.8,18z M74.2,28.5h-7.5V18h7.5c2.9,0,5.2,2.3,5.2,5.2S77.1,28.5,74.2,28.5z M55.3,28.5h-7.5V18h7.5c2.9,0,5.2,2.3,5.2,5.2S58.2,28.5,55.3,28.5z M36.4,28.5h-7.5V18h7.5c2.9,0,5.2,2.3,5.2,5.2S39.3,28.5,36.4,28.5z M93.1,28.5h-7.5V18h7.5c2.9,0,5.2,2.3,5.2,5.2S96,28.5,93.1,28.5z" fill="#0668E1"/>
                </svg>
              </div>
              <div className="w-[120px] h-[45px] flex items-center justify-center">
                <svg viewBox="0 0 120 36" className="w-full h-full">
                  <path d="M60,7.4c-6,0-10.9,4.9-10.9,10.9c0,6,4.9,10.9,10.9,10.9c6,0,10.9-4.9,10.9-10.9C70.9,12.3,66,7.4,60,7.4z M77.9,18.2c0,9.9-8,17.9-17.9,17.9c-9.9,0-17.9-8-17.9-17.9c0-9.9,8-17.9,17.9-17.9C69.9,0.3,77.9,8.3,77.9,18.2z M41.9,25.9c-2.2,0-3.7-1.3-3.7-3.4s1.4-3.4,3.7-3.4c2.3,0,3.8,1.3,3.8,3.4S44.2,25.9,41.9,25.9z M78.2,25.9c-2.2,0-3.7-1.3-3.7-3.4s1.4-3.4,3.7-3.4c2.3,0,3.8,1.3,3.8,3.4S80.5,25.9,78.2,25.9z" fill="#1877F2"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards - Side-by-side layout */}
        <section className="w-full py-[40px] md:py-[60px] bg-gradient-to-b from-white to-blue-50 relative">
          <div className="absolute top-[20%] right-[5%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-purple-300/10 to-pink-300/10 blur-3xl"></div>
          <div className="max-w-[1066px] mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Text content */}
              <div className="w-full md:w-1/2 md:pr-8">
                <p className="text-blue-600 font-medium text-sm mb-3">Document creation</p>
                <h2 className="text-[28px] md:text-[36px] font-bold text-[#1d1d1f] mb-4 leading-[1.1]">
                  Rapid document creation through prompting
                </h2>
                <p className="text-[16px] md:text-[18px] text-[#494949] leading-[1.5] max-w-[550px]">
                  Create polished business documents in minutes instead of hours. Simply describe what you need, and DocGPT's AI will generate a complete, professionally structured document ready for review and sharing.
                </p>
              </div>
              {/* Image content */}
              <div className="w-full md:w-1/2 mt-8 md:mt-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 p-2 shadow-sm">
                  <img 
                    src="https://placehold.co/800x500/f8f8f8/e0e0e0?text=MacBook+with+DocGPT" 
                    alt="Rapid document creation interface" 
                    className="w-full h-[250px] md:h-[300px] object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Second feature card */}
        <section className="w-full py-[40px] md:py-[60px] bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-[1066px] mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Text content */}
              <div className="w-full md:w-1/2 md:pr-8">
                <p className="text-purple-600 font-medium text-sm mb-3">AI writing</p>
                <h2 className="text-[28px] md:text-[36px] font-bold text-[#1d1d1f] mb-4 leading-[1.1]">
                  Human-quality writing with specialized AI agents
                </h2>
                <p className="text-[16px] md:text-[18px] text-[#494949] leading-[1.5] max-w-[550px]">
                  Our AI writing agents ensure your documents always read like they were written by a human. Whether it's formal business proposals or creative content, DocGPT adapts to your desired tone and style seamlessly.
                </p>
              </div>
              {/* Image content */}
              <div className="w-full md:w-1/2 mt-8 md:mt-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 p-2 shadow-sm">
                  <img 
                    src="https://placehold.co/600x450/f8f8f8/e0e0e0?text=AI+Writing+Agents" 
                    alt="AI writing agents interface" 
                    className="w-full h-[250px] md:h-[300px] object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Third feature card */}
        <section className="w-full py-[40px] md:py-[60px] bg-white relative">
          <div className="absolute top-[30%] left-[5%] w-[250px] h-[250px] rounded-full bg-gradient-to-r from-orange-300/10 to-pink-300/10 blur-3xl"></div>
          <div className="max-w-[1066px] mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Text content */}
              <div className="w-full md:w-1/2 md:pr-8">
                <p className="text-pink-600 font-medium text-sm mb-3">Integrations</p>
                <h2 className="text-[28px] md:text-[36px] font-bold text-[#1d1d1f] mb-4 leading-[1.1]">
                  Seamless integration with your everyday tools
                </h2>
                <p className="text-[16px] md:text-[18px] text-[#494949] leading-[1.5] max-w-[550px]">
                  DocGPT works with the tools you already use. Simply paste URLs from Google Docs, Slides, Sheets, or Slack conversations to add them as context for your document. No need to switch between multiple applications or platforms.
                </p>
              </div>
              {/* Image content */}
              <div className="w-full md:w-1/2 mt-8 md:mt-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 p-2 shadow-sm">
                  <img 
                    src="https://placehold.co/800x500/f8f8f8/e0e0e0?text=Integrations+Ecosystem" 
                    alt="Integrations with everyday tools" 
                    className="w-full h-[250px] md:h-[300px] object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Fourth feature card */}
        <section className="w-full py-[40px] md:py-[60px] bg-gradient-to-b from-white to-blue-50 relative">
          <div className="absolute bottom-[10%] right-[10%] w-[200px] h-[200px] rounded-full bg-gradient-to-r from-blue-300/10 to-purple-300/10 blur-3xl"></div>
          <div className="max-w-[1066px] mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Text content */}
              <div className="w-full md:w-1/2 md:pr-8">
                <p className="text-orange-600 font-medium text-sm mb-3">Templates</p>
                <h2 className="text-[28px] md:text-[36px] font-bold text-[#1d1d1f] mb-4 leading-[1.1]">
                  Premium templates from top companies
                </h2>
                <p className="text-[16px] md:text-[18px] text-[#494949] leading-[1.5] max-w-[550px]">
                  Access professional templates for PRDs and other business documents used by leading companies. Create documents that follow industry best practices with just a few clicks, saving you time and ensuring consistent quality.
                </p>
              </div>
              {/* Image content */}
              <div className="w-full md:w-1/2 mt-8 md:mt-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 p-2 shadow-sm">
                  <img 
                    src="https://placehold.co/800x500/f8f8f8/e0e0e0?text=Professional+Templates" 
                    alt="Professional templates gallery" 
                    className="w-full h-[250px] md:h-[300px] object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="w-full py-[50px] md:py-[80px] px-4 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[10%] right-[15%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-blue-300/20 to-purple-300/20 blur-3xl"></div>
            <div className="absolute bottom-[20%] left-[10%] w-[250px] h-[250px] rounded-full bg-gradient-to-r from-pink-300/20 to-orange-300/20 blur-3xl"></div>
          </div>
          <div className="max-w-[1066px] mx-auto relative z-10">
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#1d1d1f] mb-[20px] text-center">
              Loved by businesses worldwide
            </h2>
            <p className="text-[17px] md:text-[19px] text-[#494949] mb-[40px] text-center max-w-[700px] mx-auto">
              Join thousands of companies that trust DocGPT to create professional documents in minutes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
              {/* Testimonial 1 */}
              <div className="bg-white/80 backdrop-blur-sm p-[30px] rounded-[18px] shadow-sm border border-white/30">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-blue-500 text-blue-500" />
                  ))}
                </div>
                <p className="text-[15px] text-[#494949] mb-4 italic">
                  "DocGPT has transformed how our team creates documents. What used to take hours now takes minutes."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#f2f2f2] mr-3"></div>
                  <div>
                    <p className="text-[15px] font-medium">Sarah Johnson</p>
                    <p className="text-[13px] text-[#86868b]">Marketing Director, Acme Inc.</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white/80 backdrop-blur-sm p-[30px] rounded-[18px] shadow-sm border border-white/30">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-purple-500 text-purple-500" />
                  ))}
                </div>
                <p className="text-[15px] text-[#494949] mb-4 italic">
                  "The templates are incredible. Professional documents with just a few clicks. Worth every penny."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#f2f2f2] mr-3"></div>
                  <div>
                    <p className="text-[15px] font-medium">Michael Chen</p>
                    <p className="text-[13px] text-[#86868b]">CEO, StartupXYZ</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white/80 backdrop-blur-sm p-[30px] rounded-[18px] shadow-sm border border-white/30">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-pink-500 text-pink-500" />
                  ))}
                </div>
                <p className="text-[15px] text-[#494949] mb-4 italic">
                  "The AI capabilities have revolutionized our content creation. Now our team can focus on strategy instead of writing."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#f2f2f2] mr-3"></div>
                  <div>
                    <p className="text-[15px] font-medium">Alex Rodriguez</p>
                    <p className="text-[13px] text-[#86868b]">Content Manager, TechCorp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA section */}
        <section className="w-full py-[60px] md:py-[100px] px-4 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-300/10 to-purple-300/10 blur-3xl"></div>
            <div className="absolute bottom-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-orange-300/10 to-pink-300/10 blur-3xl"></div>
          </div>
          <div className="max-w-[800px] mx-auto text-center relative z-10">
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#1d1d1f] mb-[15px] leading-[1.2]">
              Ready to transform your document creation?
            </h2>
            <p className="text-[17px] md:text-[21px] text-[#494949] mb-[30px] max-w-[600px] mx-auto">
              Join thousands of businesses saving time and creating professional documents with DocGPT.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/trial" className="text-center text-[17px] text-white bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full transition-all duration-300 font-medium inline-flex items-center justify-center shadow-lg hover:shadow-xl">
                Try for free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/demo" className="text-center text-[17px] text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50/50 backdrop-blur-sm border border-blue-200 px-8 py-4 rounded-full transition-colors font-medium inline-flex items-center justify-center">
                Request a demo
              </Link>
            </div>
            
            {/* Trust signals */}
            <div className="mt-8 text-sm text-[#86868b]">
              <p>No credit card required • 14-day free trial • Cancel anytime</p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Apple-style Footer */}
      <footer className="w-full py-[35px] bg-blue-50/80 backdrop-blur-sm text-blue-900/70 text-[12px] border-t border-blue-100">
        <div className="max-w-[1066px] mx-auto px-4">
          <div className="border-b border-blue-100 pb-[20px] mb-[20px]">
            <p className="max-w-[672px] leading-[1.33]">
              1. DocGPT is designed to assist with document creation. The quality of output may vary based on inputs.
              <br />2. Available on web browsers and mobile devices with internet connectivity.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[30px]">
            <div>
              <h3 className="font-semibold mb-[0.8em] text-[12px] text-blue-900">DocGPT</h3>
              <ul className="space-y-[0.8em]">
                <li><Link href="/overview" className="hover:text-blue-600 transition-colors">Overview</Link></li>
                <li><Link href="/features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                <li><Link href="/support" className="hover:text-blue-600 transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-[0.8em] text-[12px] text-purple-800">Account</h3>
              <ul className="space-y-[0.8em]">
                <li><Link href="/login" className="hover:text-purple-600 transition-colors">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-purple-600 transition-colors">Create Account</Link></li>
                <li><Link href="/profile" className="hover:text-purple-600 transition-colors">My Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-[0.8em] text-[12px] text-pink-800">Resources</h3>
              <ul className="space-y-[0.8em]">
                <li><Link href="/templates" className="hover:text-pink-600 transition-colors">Templates</Link></li>
                <li><Link href="/tutorials" className="hover:text-pink-600 transition-colors">Tutorials</Link></li>
                <li><Link href="/documentation" className="hover:text-pink-600 transition-colors">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-[0.8em] text-[12px] text-orange-800">Legal</h3>
              <ul className="space-y-[0.8em]">
                <li><Link href="/terms" className="hover:text-orange-600 transition-colors">Terms of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-orange-600 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-[30px] pt-[20px] border-t border-blue-100 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[12px]">&copy; {new Date().getFullYear()} DocGPT. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-[24px] text-[12px]">
              <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Use</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Sales Policy</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Legal</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Site Map</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}