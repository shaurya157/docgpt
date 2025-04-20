'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import AmazonLogo from '@/assets/images/amazon-logo-squid-ink-smile-orange.png';
import EditWithEaseImage from '@/assets/images/Editwithease.png';
import GDriveLogo from '@/assets/images/GDrive logo.png';
import GenerateDocumentsImage from '@/assets/images/generate documents.png';
import GoogleLogo from '@/assets/images/Google_Logo_0.svg';
import Heroimage from '@/assets/images/Heroimage.png';
import MetaLogo from '@/assets/images/Meta_lockup_positive primary_RGB.svg';
import SlackLogo from '@/assets/images/Slack.png';
import TemplatesImage from '@/assets/images/templates.png';
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
    <div className="flex flex-col min-h-screen font-sans bg-white">
      {/* Navigation */}
      <div className={`transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''}`}>
        <PreLoginHeader />
      </div>

      {/* Main Content */}
      <main className="w-full flex flex-col">
        {/* Hero Section - High-converting split layout */}
        <section className="relative bg-gradient-to-br from-white to-blue-50 overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="absolute right-0 top-0 h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 Z" fill="#0070f3" />
            </svg>
          </div>
          
          <div className="container mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-24">
            <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-8 md:gap-4">
              
              {/* Left Column - Copy & CTA */}
              <div className="md:w-[45%] z-10 flex flex-col items-start">
                {/* Super Badge */}
                <div className="inline-block bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-5">
                  <p className="text-blue-600 text-sm font-medium flex items-center">
                    <span className="mr-1">⚡</span> Create PRDs in minutes, not days
                  </p>
                </div>
                
                {/* Headline with Gradient */}
                <h1 className="text-[2.5rem] md:text-[3.5rem] font-bold tracking-tight text-gray-900 mb-4 leading-[1.1] max-w-[600px]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Create perfect PRDs</span>{' '}
                  <span>in minutes</span>
                </h1>
                
                {/* Subheadline */}
                <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-[550px]">
                  DocGPT is the best way to create and edit PRDs with AI. Just tell DocGPT what you want to write a PRD about and watch it create a first draft for you in seconds. Edit your PRD using the side-by-side chat pane to rapidly incorporate changes. 
                </p>
                
                {/* CTA Stack */}
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-8 w-full sm:w-auto">
                  <SignIn 
                    className="w-full sm:w-auto px-8 h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center group" 
                    displayText="Get started for free"
                  />
                </div>
                
                {/* Social Proof */}
                <div className="flex flex-col items-start">
                  <p className="text-sm uppercase text-gray-500 font-medium tracking-wider mb-5">Used by employees at</p>
                  <div className="flex items-center justify-between gap-3 w-full">
                    <Image 
                      className="h-8 w-auto opacity-100 transition-all hover:scale-105 mt-3" 
                      alt="Amazon" 
                      src={AmazonLogo}
                      height={32}
                      width={120}
                    />
                    <Image 
                      className="h-16 w-auto opacity-100 transition-all hover:scale-105" 
                      alt="Meta" 
                      src={MetaLogo}
                      height={64}
                      width={200}
                    />
                    <Image 
                      className="h-8 w-auto opacity-100 transition-all hover:scale-105" 
                      alt="Google" 
                      src={GoogleLogo}
                      height={32}
                      width={120}
                    />
                    <Image 
                      className="h-16 w-auto opacity-100 transition-all hover:scale-105" 
                      alt="Uber" 
                      src={UberLogo}
                      height={64}
                      width={160}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Column - App Preview */}
              <div className="md:w-[55%] flex justify-center md:justify-end">
                <div className="relative w-full max-w-2xl">
                  {/* Drop Shadow Effect */}
                  <div className="absolute -bottom-6 left-0 right-0 mx-auto w-[90%] h-12 bg-blue-900/20 blur-xl rounded-full z-0"></div>
                  
                  {/* Floating UI */}
                  <div className="relative z-10 rounded-xl overflow-hidden border border-gray-200 shadow-2xl">
                    <Image 
                      className="w-full h-auto object-cover" 
                      src={Heroimage} 
                      alt="DocGPT Interface"
                      width={900}
                      height={600}
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Save 5+ hours every week with DocGPT
              </h2>
              <p className="text-xl text-gray-600">
                DocGPT gives you the power of LLMs within a document editor to help you create high quality PRDs faster than ever before.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:border-blue-100">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">10x Faster Creation</h3>
                <p className="text-gray-600">
                  Create comprehensive PRDs, specs, and documentation in minutes instead of hours. Let AI handle the heavy lifting.
                </p>
              </div>
              
              {/* Benefit 2 */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:border-blue-100">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Chat with Your Document</h3>
                <p className="text-gray-600">
                  Our side-by-side chat interface lets you request changes and see them applied instantly as you work.
                </p>
              </div>
              
              {/* Benefit 3 */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:border-blue-100">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Quality</h3>
                <p className="text-gray-600">
                  Our AI is fine-tuned to reduce "AI slop" - keeping your PRDs information dense. 
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Showcase - Side by Side */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              {/* Content */}
              <div className="md:w-1/2">
                <div className="inline-block bg-blue-100 rounded-full px-3 py-1 text-blue-800 text-sm font-medium mb-5">
                  Side-by-side editor
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">Chat with AI while you edit</h2>
                <p className="text-lg text-gray-700 mb-8">
                  Our unique dual-pane interface lets you chat with our AI assistant while simultaneously editing your document. Simply ask for what you need and watch changes appear instantly.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Request specific changes in natural language</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">See changes highlighted in real-time</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Accept or reject suggestions with one click</p>
                  </div>
                </div>
              </div>
              
              {/* Image */}
              <div className="md:w-1/2">
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                  <Image 
                    className="w-full h-auto"
                    src={Heroimage}
                    alt="DocGPT Side-by-Side Interface"
                    width={700}
                    height={500}
                  />
                  
                  {/* Floating UI indicator */}
                  {/* <div className="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full w-24 h-24 flex items-center justify-center transform rotate-12 shadow-lg">
                    <div className="text-center text-sm font-bold leading-tight">
                      <p>AI-powered</p>
                      <p>Assistant</p>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Showcase - Templates */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
              {/* Content */}
              <div className="md:w-1/2">
                <div className="inline-block bg-indigo-100 rounded-full px-3 py-1 text-indigo-800 text-sm font-medium mb-5">
                  Custom templates
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">Start with professional templates</h2>
                <p className="text-lg text-gray-700 mb-8">
                  Choose from our library of professional templates or upload your own - we support the templates you use at work everyday. 
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Professional PRD templates</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Upload your existing documents as templates</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-1 mr-3">
                      <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Save your custom templates for future use</p>
                  </div>
                </div>
              </div>
              
              {/* Image */}
              <div className="md:w-1/2">
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                  <Image 
                    className="w-full h-auto"
                    src={TemplatesImage}
                    alt="DocGPT Templates Showcase"
                    width={700}
                    height={500}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block bg-amber-100 rounded-full px-3 py-1 text-amber-800 text-sm font-medium mb-5">
                Coming Soon
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
                PRDs that understand your business context
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                We're working on connecting DocGPT with your favorite tools so the PRDs you write will be highly contexually relevant. 
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Slack Integration */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="h-2 bg-[#4A154B]"></div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mr-3 overflow-hidden">
                      <Image 
                        src={SlackLogo} 
                        alt="Slack Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Slack</h3>
                    <div className="ml-auto py-1 px-2 bg-blue-100 rounded text-xs font-semibold text-blue-800">Q2 2023</div>
                  </div>
                  
                  <p className="text-gray-600 mb-5">
                    DocGPT will search through Slack for relevant context when creating PRDs. You will also be able to paste in slack channels and threads as context for your PRDs. 
                  </p>
                  
                  <Link 
                    href="/contact"
                    className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center"
                  >
                    Join waitlist
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              {/* Google Drive Integration */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="h-2 bg-[#0070f3]"></div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mr-3 overflow-hidden">
                      <Image 
                        src={GDriveLogo} 
                        alt="Google Drive Logo" 
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Google Drive</h3>
                    <div className="ml-auto py-1 px-2 bg-blue-100 rounded text-xs font-semibold text-blue-800">Q3 2023</div>
                  </div>
                  
                  <p className="text-gray-600 mb-5">
                    DocGPT will search through your Google Drive for relevant context when creating PRDs. You will also be able to paste links to Google Docs, Sheets, and Slides as context for your PRDs. 
                  </p>
                  
                  <Link 
                    href="/contact"
                    className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center"
                  >
                    Join waitlist
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              {/* GitHub Integration */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="h-2 bg-[#24292e]"></div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#24292e] flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">GitHub</h3>
                    <div className="ml-auto py-1 px-2 bg-blue-100 rounded text-xs font-semibold text-blue-800">Q4 2023</div>
                  </div>
                  
                  <p className="text-gray-600 mb-5">
                    DocGPT will search your codebase for relevant context when creating PRDs to make sure the requirements it generates are highly relevant. 
                  </p>
                  
                  <Link 
                    href="/contact"
                    className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center"
                  >
                    Join waitlist
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-500 to-blue-700 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Create your first PRD in minutes
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Save hours every week with DocGPT's AI-powered document editor.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <SignIn 
                  className="px-8 h-14 bg-white text-blue-600 hover:bg-blue-50 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  displayText="Start free - No credit card"
                />
              </div>
            </div>
            
            {/* Satisfaction Guarantee */}
            <div className="mt-16 max-w-sm mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center space-x-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-white font-medium">100% satisfaction guarantee</p>
                <p className="text-blue-200 text-sm">Cancel anytime, no questions asked</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-8 md:mb-0">
                <div className="text-2xl font-bold mb-2">DocGPT</div>
                <p className="text-gray-400 text-sm">Create perfect documents with AI</p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-center md:text-left">
                <span className="text-gray-300 cursor-default">Pricing</span>
                <span className="text-gray-300 cursor-default">Privacy</span>
                <span className="text-gray-300 cursor-default">Terms</span>
                <span className="text-gray-300 cursor-default">Contact</span>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2025 DocGPT. All rights reserved.</p>
              <div className="flex space-x-6">
                <span className="text-gray-400 cursor-default">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </span>
                <span className="text-gray-400 cursor-default">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </span>
                <span className="text-gray-400 cursor-default">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}