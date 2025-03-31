'use client';

import { useEffect, useState } from 'react';

import { ArrowRight } from "lucide-react";
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import AmazonLogo from '@/assets/images/amazon-logo-squid-ink-smile-orange.png';
import AmazonBRD from '@/assets/images/Amazon BRD.png';
import ChatPromptImage from '@/assets/images/Chat prompt.png';
import DeepSeekLogo from '@/assets/images/DeepSeek_idPu03Khfd_1.svg';
import GoogleLogo from '@/assets/images/Google_Logo_0.svg';
import MainUIImage from '@/assets/images/mainui2.png';
import MetaLogo from '@/assets/images/Meta_lockup_positive primary_RGB.svg';
import OpenAIFullLogo from '@/assets/images/OpenAI full.png';
import UberLogo from '@/assets/images/Uber_Logo_Black_RGB.svg';
import { SignIn } from '@/components/landing/auth';
import PreLoginHeader from '@/components/landing/pre-login-header';

export default function Landing() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (session?.user) {
    return redirect('/home');
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#f5f5f7] font-sans">
      {/* Apple-style Navigation - with subtle animation on scroll */}
      <PreLoginHeader />

      {/* Main Content */}
      <main className="w-full flex flex-col items-center bg-[#f5f5f7]">
        {/* Hero Section - Text on left, image on right */}
        <section className="w-full py-[60px] md:py-[120px] bg-[#f5f5f7] relative overflow-hidden">
          <div className="relative max-w-[1066px] mx-auto px-4 z-10">
            <div className="flex flex-col items-center">
              {/* Text content */}
              <div className="w-full text-center md:text-center mb-16">
                <h1 className="text-[48px] md:text-[72px] lg:text-[88px] font-bold tracking-tight text-[#1d1d1f] mb-6 md:mb-8 leading-[1.1]">
                  The AI document editor
                </h1>
                <p className="text-[17px] md:text-[21px] text-[#494949] leading-[1.47] font-normal mb-8 mx-auto md:max-w-[70%]">
                  Built to make writing documents 10x faster, DocGPT is the best way to create and edit documents using AI. 
                </p>

                <div className="mt-[32px] md:mt-[40px] flex flex-col sm:flex-row justify-center md:justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <SignIn 
                    className="text-center text-[17px] text-white bg-[#007AFF] hover:bg-[#0062cc] w-[200px] h-[48px] rounded-full transition-all duration-300 font-medium flex items-center justify-center shadow-md hover:shadow-lg" 
                    displayText="Try for free"
                  />
                  <Link className="text-center text-[17px] text-[#007AFF] hover:bg-[#007AFF]/5 bg-transparent border border-[#007AFF] w-[200px] h-[48px] rounded-full transition-all duration-300 font-medium flex items-center justify-center shadow-md hover:shadow-lg" href="/contact">
                    Request a demo
                  </Link>
                </div>
              </div>
              
              {/* Image container */}
              <div className="w-full max-w-[1200px] mx-auto mt-4 mb-8">
                <div className="relative w-full">
                  <Image 
                    className="w-full rounded-[24px] shadow-lg" 
                    alt="DocGPT document editor interface" 
                    src={MainUIImage}
                    width={1200}
                    height={675}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Logos section */}
        <section className="w-full py-20 bg-white">
          <div className="max-w-[1066px] mx-auto px-4">
            <p className="text-center text-[#86868b] font-medium mb-10 text-sm uppercase tracking-wider">Used by employees at</p>
            <div className="flex flex-nowrap justify-center items-center gap-8 md:gap-16 opacity-90 overflow-x-hidden">
              <div className="w-[220px] h-[80px] flex items-center justify-center">
                <Image 
                  className="w-auto h-[40px] object-contain mt-[10px]" 
                  alt="Amazon Logo" 
                  src={AmazonLogo}
                  width={220}
                  height={80}
                />
              </div>
              <div className="w-[220px] h-[80px] flex items-center justify-center">
                <Image 
                  className="w-auto h-[80px] object-contain" 
                  alt="Uber Logo" 
                  src={UberLogo}
                  width={220}
                  height={80}
                />
              </div>
              <div className="w-[220px] h-[80px] flex items-center justify-center">
                <Image 
                  className="w-auto h-[80px] object-contain" 
                  alt="Meta Logo" 
                  src={MetaLogo}
                  width={220}
                  height={80}
                />
              </div>
              <div className="w-[220px] h-[80px] flex items-center justify-center">
                <Image 
                  className="w-auto h-[45px] object-contain" 
                  alt="Google Logo" 
                  src={GoogleLogo}
                  width={220}
                  height={80}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Feature Cards - Side-by-side layout */}
        <section className="w-full py-[80px] md:py-[120px] bg-[#f5f5f7]">
          <div className="max-w-[1066px] mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Text content */}
              <div className="w-full md:w-1/2 md:pr-12">
                <p className="text-[#007AFF] font-medium text-sm mb-3">Document creation</p>
                <h2 className="text-[32px] md:text-[40px] font-bold text-[#1d1d1f] mb-6 leading-[1.1]">
                  Create polished documents in seconds
                </h2>
                <p className="text-[17px] md:text-[19px] text-[#494949] leading-[1.5] max-w-[550px]">
                  Just tell DocGPT about the document you want it to create and watch it draft a complete document for your review in mere seconds. 
                </p>
              </div>
              {/* Image content */}
              <div className="w-full md:w-1/2 mt-10 md:mt-0">
                <div className="rounded-2xl overflow-hidden shadow-md bg-white">
                  <Image 
                    className="w-full h-auto object-cover rounded-xl" 
                    alt="DocGPT chat interface with prompt" 
                    src={ChatPromptImage}
                    width={800}
                    height={500}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fourth feature card */}
        <section className="w-full py-[80px] md:py-[120px] bg-white">
          <div className="max-w-[1066px] mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Image content - reversed order on desktop */}
              <div className="w-full md:w-1/2 mt-10 md:mt-0 order-2 md:order-1">
                <div className="rounded-2xl overflow-hidden shadow-md">
                  <Image 
                    className="w-full h-auto object-cover rounded-xl" 
                    alt="Amazon BRD template example" 
                    src={AmazonBRD}
                    width={800}
                    height={500}
                  />
                </div>
              </div>
              {/* Text content */}
              <div className="w-full md:w-1/2 md:pl-12 order-1 md:order-2">
                <p className="text-[#007AFF] font-medium text-sm mb-3">Templates</p>
                <h2 className="text-[32px] md:text-[40px] font-bold text-[#1d1d1f] mb-6 leading-[1.1]">
                  Fill out any template you want
                </h2>
                <p className="text-[17px] md:text-[19px] text-[#494949] leading-[1.5] max-w-[550px]">
                  Pick from our provided templates or use your own. Writing PRDs, PRFAQs, marketing briefs in your company template has never been easier.  
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Models section */}
        <section className="w-full py-[60px] md:py-[80px] bg-[#f5f5f7]">
          <div className="max-w-[1066px] mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-start">
              {/* Text content */}
              <div className="w-full md:w-2/5 md:pr-12 mb-8 md:mb-0">
                <p className="text-[#007AFF] font-medium text-sm mb-2">Advanced AI Models</p>
                <h2 className="text-[28px] md:text-[36px] font-bold text-[#1d1d1f] mb-4 leading-[1.1]">
                  Use the best AI models available
                </h2>
                <p className="text-[16px] md:text-[18px] text-[#494949] leading-[1.5]">
                  Create powerful documents with the latest AI models on offer
                </p>
              </div>
              
              {/* Model cards - vertical stack of pills */}
              <div className="w-full md:w-3/5">
                <div className="flex flex-col space-y-4">
                  {/* First row of pills */}
                  <div className="flex flex-wrap gap-6">
                    {/* OpenAI O1 */}
                    <div className="bg-white py-3 px-6 rounded-full shadow-sm flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <Image 
                          src={OpenAIFullLogo}
                          alt="OpenAI Logo"
                          width={180}
                          height={40}
                          className="h-6 w-auto"
                        />
                      </div>
                      <h3 className="font-medium text-[#1d1d1f] text-[18px]">O1</h3>
                    </div>
                    
                    {/* OpenAI GPT-4o */}
                    <div className="bg-white py-3 px-6 rounded-full shadow-sm flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <Image 
                          src={OpenAIFullLogo}
                          alt="OpenAI Logo"
                          width={180}
                          height={40}
                          className="h-6 w-auto"
                        />
                      </div>
                      <h3 className="font-medium text-[#1d1d1f] text-[18px]">GPT-4o</h3>
                    </div>
                  </div>
                  
                  {/* DeepSeek R1 pill only */}
                  <div className="flex flex-wrap gap-6">
                    {/* DeepSeek R1 */}
                    <div className="bg-white py-3 px-6 rounded-full shadow-sm flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <Image 
                          src={DeepSeekLogo}
                          alt="DeepSeek Logo"
                          width={180}
                          height={40}
                          className="h-7 w-auto"
                        />
                      </div>
                      <h3 className="font-medium text-[#1d1d1f] text-[18px]">R1</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      
        {/* Final CTA section */}
        <section className="w-full py-[80px] md:py-[120px] px-4 bg-[#f5f5f7]">
          <div className="max-w-[800px] mx-auto text-center bg-white py-16 px-8 rounded-2xl shadow-sm">
            <h2 className="text-[32px] md:text-[48px] font-bold text-[#1d1d1f] mb-[24px] leading-[1.2]">
              Ready to transform your document writing?
            </h2>
            {/* <p className="text-[17px] md:text-[21px] text-[#494949] mb-[40px] max-w-[600px] mx-auto">
              Start writing with DocGPT and create powerful documents in minutes. 
            </p> */}
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <SignIn 
                className="text-center text-[17px] text-white bg-[#007AFF] hover:bg-[#0062cc] w-[200px] h-[48px] rounded-full transition-all duration-300 font-medium flex items-center justify-center shadow-md hover:shadow-lg" 
                displayText="Try for free"
              />
              <Link className="text-center text-[17px] text-[#007AFF] hover:bg-[#007AFF]/5 bg-transparent border border-[#007AFF] w-[200px] h-[48px] rounded-full transition-all duration-300 font-medium flex items-center justify-center shadow-md hover:shadow-lg" href="/contact">
                Request a demo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}