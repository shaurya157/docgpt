'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import AmazonLogo from '@/assets/images/amazon-logo-squid-ink-smile-orange.png';
import AmazonBRD from '@/assets/images/Amazon BRD.png';
import ChatPromptImage from '@/assets/images/Chat prompt.png';
import DeepSeekLogo from '@/assets/images/DeepSeek_idPu03Khfd_1.svg';
import EditWithEaseImage from '@/assets/images/Editwithease.png';
import GenerateDocumentsImage from '@/assets/images/generate documents.png';
import GoogleLogo from '@/assets/images/Google_Logo_0.svg';
import HeroImageV5 from '@/assets/images/herouiv5.png';
import HeroImageV3 from '@/assets/images/herouiv3.png';
import HeroImageV2 from '@/assets/images/Hero image v2.png';
import HeroImage from '@/assets/images/Hero image.png';
import MainUIImage from '@/assets/images/mainui2.png';
import MetaLogo from '@/assets/images/Meta_lockup_positive primary_RGB.svg';
import OpenAIFullLogo from '@/assets/images/OpenAI full.png';
import UberLogo from '@/assets/images/Uber_Logo_Black_RGB.svg';
import WhatToBuildImage from '@/assets/images/What do you want to build.png';
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
        <section className="w-full py-[60px] md:py-[80px] bg-[#f5f5f7] relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex flex-col">
              {/* Left column - Text content */}
              <div className="w-full mb-12">
                {/* Badge */}
                <div className="inline-block bg-[#e6f2ff] rounded-full px-4 py-2 mb-6">
                  <p className="text-[#0070f3] text-sm font-medium flex items-center">
                    <span className="w-2 h-2 bg-[#0070f3] rounded-full mr-2"></span>
                    Save 5+ hours every week
                  </p>
                </div>
                
                {/* Heading */}
                <h1 className="text-[40px] md:text-[48px] lg:text-[56px] font-bold tracking-tight text-[#1d1d1f] mb-6 leading-[1.1]">
                  Automate your product documentation
                </h1>
                
                {/* Description */}
                <p className="text-[18px] text-[#494949] leading-[1.5] mb-8 max-w-[900px]">
                Let our team of AI-agents write and edit your PRDs, experiment plans, launch plans, press releases, and more through our custom document editing interface. Spend less time documenting and more time building. 
                </p>
                
                {/* CTA and Trusted By section in flex layout */}
                <div className="flex flex-col md:flex-row md:items-start w-full">
                  {/* CTA Button and Free trial text */}
                  <div className="md:max-w-[320px]">
                    <div className="mb-4">
                      <SignIn 
                        className="inline-block text-center text-[17px] text-white bg-[#0070f3] hover:bg-[#0060d3] px-8 h-[52px] rounded-md transition-all duration-300 font-medium flex items-center justify-center shadow-md hover:shadow-lg" 
                        displayText="Start creating documents"
                      />
                    </div>
                    
                    {/* Free trial text */}
                    <p className="text-[16px] text-[#666] mb-12 md:mb-0">
                      Free trial • No credit card required
                    </p>
                  </div>
                  
                  {/* Trusted by section */}
                  <div className="md:ml-16 md:mt-0">
                    <p className="text-[14px] text-[#8a8a8a] uppercase font-medium tracking-wide mb-4">Used by employees at</p>
                    <div className="flex items-center space-x-6 md:space-x-7">
                      <Image 
                        className="w-auto h-7"
                        alt="Amazon Logo" 
                        height={28}
                        src={AmazonLogo}
                        width={95}
                      />
                      <Image 
                        className="w-auto h-14"
                        alt="Meta Logo" 
                        height={56}
                        src={MetaLogo}
                        width={180}
                      />
                      <Image 
                        className="w-auto h-8"
                        alt="Google Logo" 
                        height={32}
                        src={GoogleLogo}
                        width={110}
                      />
                      <Image 
                        className="w-auto h-14"
                        alt="Uber Logo" 
                        height={56}
                        src={UberLogo}
                        width={140}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Image Section */}
        <section className="w-full pb-[60px] bg-[#f5f5f7]">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image 
                className="w-full h-auto object-cover"
                alt="DocGPT document editor interface" 
                height={800}
                src={HeroImageV5}
                width={1400}
                priority
              />
            </div>
          </div>
        </section>
        
        {/* How it Works - 3 Steps Section */}
        <section className="w-full py-24 bg-[#f5f5f7]">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-[36px] md:text-[44px] font-bold text-[#1d1d1f] mb-6 text-center">
              How it works
            </h2>
            <p className="text-[18px] text-[#494949] text-center max-w-[700px] mx-auto mb-20">
              DocGPT streamlines your documentation workflow with a simple three-step process
            </p>
            
            <div className="flex flex-col gap-24">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <div className="md:w-2/5 flex flex-col items-center md:items-start">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#0070f3] text-white text-xl font-bold mb-6 shadow-md">
                    1
                  </div>
                  <h3 className="text-[26px] font-bold text-[#1d1d1f] mb-4 text-center md:text-left">Create your project</h3>
                  <p className="text-[17px] text-[#494949] leading-[1.6] text-center md:text-left">
                    Simply describe what you're building. DocGPT integrates with your Drive and Slack to gather relevant context for more accurate document generation.
                  </p>
                </div>
                <div className="md:w-3/5 rounded-xl overflow-hidden">
                  <Image 
                    className="w-full max-w-[600px] h-auto object-cover rounded-xl mx-auto"
                    alt="Project creation interface asking what you want to build" 
                    height={450}
                    src={WhatToBuildImage}
                    width={800}
                    priority
                  />
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16">
                <div className="md:w-2/5 flex flex-col items-center md:items-start">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#0070f3] text-white text-xl font-bold mb-6 shadow-md">
                    2
                  </div>
                  <h3 className="text-[26px] font-bold text-[#1d1d1f] mb-4 text-center md:text-left">Generate documents</h3>
                  <p className="text-[17px] text-[#494949] leading-[1.6] text-center md:text-left">
                    Select from a wide range of document types including PRDs, engineering plans, experiment plans, press releases, and more. Or let our team of AI-agents create new files from scratch in your project. 
                  </p>
                </div>
                <div className="md:w-3/5 rounded-xl overflow-hidden">
                  <Image 
                    className="w-full max-w-[600px] h-auto object-cover rounded-xl mx-auto"
                    alt="Generate documents interface showing various document types" 
                    height={337}
                    src={GenerateDocumentsImage}
                    width={600}
                    priority
                  />
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <div className="md:w-2/5 flex flex-col items-center md:items-start">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#0070f3] text-white text-xl font-bold mb-6 shadow-md">
                    3
                  </div>
                  <h3 className="text-[26px] font-bold text-[#1d1d1f] mb-4 text-center md:text-left">Edit with ease</h3>
                  <p className="text-[17px] text-[#494949] leading-[1.6] text-center md:text-left mb-8">
                    Make changes across multiple documents simultaneously using our intelligent chat interface. Preview all updates with our intuitive accept/reject interface before finalizing.
                  </p>
                  
                  {/* Sub-sections */}
                  <div className="w-full space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e6f2ff] text-[#0070f3] text-sm font-bold shrink-0 mx-auto md:mx-0">
                        1
                      </div>
                      <div>
                        <h4 className="text-[18px] font-semibold text-[#1d1d1f] mb-2 text-center md:text-left">Make targeted edits within a single doc</h4>
                        <p className="text-[15px] text-[#494949] leading-[1.5] text-center md:text-left">
                          Request specific changes to any section of your document and watch as DocGPT intelligently applies the updates and asks for approval before finalizing.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e6f2ff] text-[#0070f3] text-sm font-bold shrink-0 mx-auto md:mx-0">
                        2
                      </div>
                      <div>
                        <h4 className="text-[18px] font-semibold text-[#1d1d1f] mb-2 text-center md:text-left">Make edits across multiple docs</h4>
                        <p className="text-[15px] text-[#494949] leading-[1.5] text-center md:text-left">
                          Have a scope change? Let DocGPT know and our AI-agents will suggest the necessary changes across multiple documents to make sure your product docs are up to date. 
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e6f2ff] text-[#0070f3] text-sm font-bold shrink-0 mx-auto md:mx-0">
                        3
                      </div>
                      <div>
                        <h4 className="text-[18px] font-semibold text-[#1d1d1f] mb-2 text-center md:text-left">Create new docs in tabs</h4>
                        <p className="text-[15px] text-[#494949] leading-[1.5] text-center md:text-left">
                          Want to write a launch announcement or another new doc? Just create a new file in the same project and tell DocGPT what you want to build. Our AI agents will look through all other files in the project and craft a highly relevant document for you. 
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-3/5 rounded-xl overflow-hidden">
                  <Image 
                    className="w-full max-w-[600px] h-auto object-cover rounded-xl mx-auto"
                    alt="Document editing interface showing accept/reject changes" 
                    height={450}
                    src={EditWithEaseImage}
                    width={800}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* AI Agents Section */}
        <section className="w-full py-20 bg-[#f5f5f7]">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-[32px] md:text-[44px] font-bold text-[#1d1d1f] mb-4 text-center">
              Specialized AI agents for every role
            </h2>
            <p className="text-[18px] text-[#494949] text-center max-w-[700px] mx-auto mb-16">
              DocGPT leverages role-specific AI agents to create targeted, high-quality documentation
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Product Manager Agent */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-[#e6f2ff] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#0070f3]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 13.2V13h-2V9c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v-2h-6V9h10v4h2v4.2c.7.4 1.2 1 1.5 1.8H19c.8 0 1.5.7 1.5 1.5S19.8 22 19 22h-1.5c-.4 0-.7-.2-.9-.5-.2.3-.5.5-.9.5H15c-.8 0-1.5-.7-1.5-1.5S14.2 19 15 19h.5c.3-.8.8-1.4 1.5-1.8z"/>
                    <path d="M12 10.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25z"/>
                  </svg>
                </div>
                <h3 className="text-[22px] font-bold text-[#1d1d1f] mb-3">Product Manager</h3>
                <p className="text-[16px] text-[#494949] leading-[1.6]">
                  Creates comprehensive PRDs, go-to-market plans, experiment briefs, and feature specifications tailored to stakeholder needs.
                </p>
              </div>
              
              {/* Data Scientist Agent */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-[#e6f2ff] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#0070f3]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5.45 11.5L9.5 10.5 5 15h14l-5.45-5.5z"/>
                  </svg>
                </div>
                <h3 className="text-[22px] font-bold text-[#1d1d1f] mb-3">Data Scientist</h3>
                <p className="text-[16px] text-[#494949] leading-[1.6]">
                  Develops data analysis plans, technical experiment docs, and metric definitions with statistical rigor and clarity.
                </p>
              </div>
              
              {/* Software Engineer Agent */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-[#e6f2ff] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#0070f3]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                  </svg>
                </div>
                <h3 className="text-[22px] font-bold text-[#1d1d1f] mb-3">Software Engineer</h3>
                <p className="text-[16px] text-[#494949] leading-[1.6]">
                  Produces technical specs, architecture documents, API documentation, and implementation guides with code-level precision.
                </p>
              </div>
              
              {/* UX Designer Agent */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-[#e6f2ff] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#0070f3]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h3 className="text-[22px] font-bold text-[#1d1d1f] mb-3">UX Designer</h3>
                <p className="text-[16px] text-[#494949] leading-[1.6]">
                  Creates design briefs, user journey maps, and UX requirements that balance aesthetic considerations with practical usability.
                </p>
              </div>
              
              {/* Operations Agent */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-[#e6f2ff] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#0070f3]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                </div>
                <h3 className="text-[22px] font-bold text-[#1d1d1f] mb-3">Operations</h3>
                <p className="text-[16px] text-[#494949] leading-[1.6]">
                  Drafts process documents, operational guidelines, and training materials focusing on efficiency and practical implementation.
                </p>
              </div>
              
              {/* Benefit card */}
              <div className="bg-[#0070f3] p-6 rounded-xl shadow-md text-white">
                <h3 className="text-[22px] font-bold mb-3">The right expertise for every document</h3>
                <p className="text-[16px] leading-[1.6]">
                  Each AI agent brings specialized knowledge to your documentation, ensuring accuracy, relevance, and best practices across all document types.
                </p>
                <div className="mt-4 pt-4 border-t border-white/30">
                  <p className="text-[15px] italic">
                    "DocGPT's specialized agents helped us create consistent documentation across our entire product development lifecycle."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Collaboration Section */}
        <section className="w-full py-20 bg-[#f5f5f7]">
          <div className="max-w-[1066px] mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Text content */}
              <div className="w-full md:w-1/2">
                <p className="text-[#007AFF] font-medium text-sm mb-3">Built-in collaboration</p>
                <h2 className="text-[32px] md:text-[40px] font-bold text-[#1d1d1f] mb-6 leading-[1.1]">
                  Faster team alignment
                </h2>
                <p className="text-[17px] text-[#494949] leading-[1.6] mb-8">
                  Stop the endless back-and-forth emails and meetings. DocGPT's built-in collaboration features let your team comment directly on documents to reach decisions and align faster.
                </p>
                
                {/* Feature list */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e6f2ff] flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-[#0070f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[16px] text-[#494949]">
                      <span className="font-medium text-[#1d1d1f]">In-line comments</span> - Add feedback directly to specific parts of any document
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e6f2ff] flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-[#0070f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[16px] text-[#494949]">
                      <span className="font-medium text-[#1d1d1f]">Version tracking</span> - See exactly what changed between document versions
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e6f2ff] flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-[#0070f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[16px] text-[#494949]">
                      <span className="font-medium text-[#1d1d1f]">AI-powered revisions</span> - DocGPT can incorporate feedback automatically
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e6f2ff] flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-[#0070f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[16px] text-[#494949]">
                      <span className="font-medium text-[#1d1d1f]">Team notifications</span> - Keep everyone in the loop on document updates
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Image/illustration content */}
              <div className="w-full md:w-1/2">
                <div className="bg-[#f5f8ff] rounded-xl p-4 shadow-lg">
                  {/* Comment thread illustration */}
                  <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-[#0070f3] text-white text-sm flex items-center justify-center font-bold mr-3">JM</div>
                      <div>
                        <p className="font-medium text-[#1d1d1f] text-[15px]">Jairaj Modak</p>
                        <p className="text-[14px] text-[#494949]">Can we add more details about the user authentication flow in this section?</p>
                        <p className="text-[12px] text-[#86868b] mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-3 shadow-sm ml-8">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-[#e6f2ff] text-[#0070f3] text-sm flex items-center justify-center font-bold mr-3">AI</div>
                      <div>
                        <p className="font-medium text-[#1d1d1f] text-[15px]">DocGPT Assistant</p>
                        <p className="text-[14px] text-[#494949]">I've drafted an expanded user authentication section. Would you like me to add it to the document?</p>
                        <p className="text-[12px] text-[#86868b] mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-[#34c759] text-white text-sm flex items-center justify-center font-bold mr-3">SK</div>
                      <div>
                        <p className="font-medium text-[#1d1d1f] text-[15px]">Sarah Kim</p>
                        <p className="text-[14px] text-[#494949]">Yes, please add it. This looks great! I've approved the changes.</p>
                        <p className="text-[12px] text-[#86868b] mt-1">30 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Logos section */}
        <section className="w-full py-20 bg-[#f5f5f7]">
          <div className="max-w-[1066px] mx-auto px-4">
            <p className="text-center text-[#86868b] font-medium mb-10 text-sm uppercase tracking-wider">Used by employees at</p>
            <div className="flex flex-nowrap justify-center items-center gap-8 md:gap-16 opacity-90 overflow-x-hidden">
              <div className="w-[220px] h-[80px] flex items-center justify-center">
                <Image 
                  className="w-auto h-[40px] object-contain mt-[10px]" 
                  alt="Amazon Logo" 
                  height={80}
                  src={AmazonLogo}
                  width={220}
                />
              </div>
              <div className="w-[220px] h-[80px] flex items-center justify-center">
                <Image 
                  className="w-auto h-[80px] object-contain" 
                  alt="Uber Logo" 
                  height={80}
                  src={UberLogo}
                  width={220}
                />
              </div>
              <div className="w-[220px] h-[80px] flex items-center justify-center">
                <Image 
                  className="w-auto h-[80px] object-contain" 
                  alt="Meta Logo" 
                  height={80}
                  src={MetaLogo}
                  width={220}
                />
              </div>
              <div className="w-[220px] h-[80px] flex items-center justify-center">
                <Image 
                  className="w-auto h-[45px] object-contain" 
                  alt="Google Logo" 
                  height={80}
                  src={GoogleLogo}
                  width={220}
                />
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