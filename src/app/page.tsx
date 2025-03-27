'use client';

import { ArrowRight, CheckCircle2, ChevronRight, Clock, Lock, Sparkles, Star, Users,Quote } from "lucide-react";
import { useSession } from 'next-auth/react';
import Image from "next/image";
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useState } from 'react';

import { Button } from "@/components/plate-ui/button";

import Chatbox from '../assets/images/chatbox.png';
import Site from '../assets/images/site.png';
import Templates from '../assets/images/templates.png';

export default function Landing() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');

  if (session?.user) {
    return redirect('/home');
  }

  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* Sticky Email Capture Bar - Appears after scrolling */}
      <div className="hidden lg:block fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-2xl rounded-full p-2 w-auto border border-indigo-100">
        <div className="flex items-center gap-2 px-2">
          <div className="text-sm text-gray-700 font-medium">Start creating better documents today:</div>
          <div className="flex items-center">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-64 px-4 py-2 rounded-l-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-r-full flex items-center font-medium transition-colors">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section - Conversion Focused */}
      <section className="w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.2] bg-[length:20px_20px]"></div>
        </div>
        
        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center bg-indigo-800/50 backdrop-blur-sm border border-indigo-700/50 rounded-full py-1 px-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                <span className="text-sm font-medium text-indigo-200">Recently featured in TechCrunch</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                Create perfect documents with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI-powered</span> precision
              </h1>
              
              {/* Subtitle with value proposition */}
              <p className="text-xl text-indigo-100 mb-8 max-w-xl">
                DocGPT combines the code precision of Cursor with the collaborative ease of Google Docs, helping teams create polished business documents in half the time.
              </p>
              
              {/* Social Proof Mini */}
              <div className="flex items-center mb-8">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-800 flex items-center justify-center text-white font-bold text-xs">TM</div>
                  <div className="w-10 h-10 rounded-full bg-purple-600 border-2 border-indigo-800 flex items-center justify-center text-white font-bold text-xs">JP</div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-indigo-800 flex items-center justify-center text-white font-bold text-xs">KL</div>
                  <div className="w-10 h-10 rounded-full bg-indigo-800 border-2 border-indigo-800 flex items-center justify-center text-white font-bold text-xs">+5K</div>
                </div>
                <div className="text-indigo-200 text-sm">
                  <span className="font-semibold">5,000+ professionals</span> are already using DocGPT
                </div>
              </div>
              
              {/* Primary CTA with Email Capture (Mobile-Friendly) */}
              <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4 mb-8">
                <div className="relative lg:max-w-md">
                  <input
                    type="email"
                    placeholder="Enter your work email"
                    className="w-full px-4 py-4 rounded-lg text-gray-900 border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="mt-2 lg:mt-0 w-full lg:absolute lg:right-1 lg:top-1 lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 lg:py-2 px-6 rounded-lg lg:rounded transition-colors">
                    Get Started Free
                  </button>
                </div>
                <div className="lg:block flex justify-center">
                  <Link href="/demo" className="text-indigo-200 flex items-center hover:text-white transition-colors font-medium">
                    See live demo <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              {/* Trust signals */}
              <div className="flex items-center text-sm text-indigo-200 space-x-4">
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-400" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-1 text-green-400" />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image/Video with Floating UI Elements */}
            <div className="relative">
              {/* Main Product Screenshot with Gradient Border */}
              <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl border border-indigo-500/30 transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                <Image 
                  src={Site} 
                  alt="DocGPT document editor interface" 
                  quality={100}
                  className="w-full h-auto"
                />
                
                {/* Floating UI Indicators */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-indigo-100 flex items-center text-sm font-medium text-indigo-900">
                  <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
                  AI assists your writing in real-time
                </div>
                
                <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-lg py-1.5 px-3 shadow-lg border border-indigo-100 flex items-center text-sm font-medium text-green-700">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  </div>
                  <span className="ml-1">4.9/5</span>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-2xl opacity-30"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full blur-2xl opacity-30"></div>
            </div>
          </div>
        </div>
        
        {/* Bottom Wave Pattern */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 160">
            <path fill="#ffffff" fillOpacity="1" d="M0,128L60,117.3C120,107,240,85,360,90.7C480,96,600,128,720,133.3C840,139,960,117,1080,101.3C1200,85,1320,75,1380,69.3L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Logos Section - Social Proof */}
      <section className="w-full py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-gray-600 font-medium">Trusted by innovative teams at</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="text-gray-400 font-bold text-xl">Microsoft</div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="text-gray-400 font-bold text-xl">Shopify</div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="text-gray-400 font-bold text-xl">Dropbox</div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="text-gray-400 font-bold text-xl">Atlassian</div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="text-gray-400 font-bold text-xl">Adobe</div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="text-gray-400 font-bold text-xl">Slack</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Key Benefits Section - Value Proposition */}
      <section className="w-full py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Create better documents in <span className="text-indigo-600">half the time</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              DocGPT combines AI-powered writing tools with intuitive collaboration features to transform your document workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="relative p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">1</div>
              <div className="h-14 w-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Save 10+ hours per week</h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Create professional documents in minutes instead of hours. Our AI assistant handles formatting, research, and editing automatically.
              </p>
              <div className="mt-2 pt-4 border-t border-gray-100">
                <Link 
                  href="/features" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center text-sm"
                >
                  Learn how it works
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Benefit 2 */}
            <div className="relative p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">2</div>
              <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Enhance document quality</h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Our context-aware AI understands your company's terminology and style, creating documents that sound like they were written by your team.
              </p>
              <div className="mt-2 pt-4 border-t border-gray-100">
                <Link 
                  href="/quality" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center text-sm"
                >
                  See quality comparison
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Benefit 3 */}
            <div className="relative p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">3</div>
              <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Streamline collaboration</h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Smart templates, version control, and real-time editing make working with your team seamless. No more back-and-forth emails.
              </p>
              <div className="mt-2 pt-4 border-t border-gray-100">
                <Link 
                  href="/collaboration" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center text-sm"
                >
                  Explore collaboration tools
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-12">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium text-lg">
              <Link href="/signup">Try DocGPT Free</Link>
            </Button>
            <p className="text-gray-500 text-sm mt-2">No credit card required</p>
          </div>
        </div>
      </section>
      
      {/* Product Showcase - Visual Demo */}
      <section className="w-full py-24 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Designed for how teams <span className="text-indigo-600">actually work</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered document editor integrates seamlessly with your current workflow, making document creation effortless.
            </p>
          </div>
          
          {/* Feature Showcase 1 - Contextual AI Writing */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1">
              <div className="mb-3 inline-flex items-center bg-blue-100 rounded-full py-1 px-3">
                <div className="h-2 w-2 rounded-full bg-blue-600 mr-2"></div>
                <span className="text-sm font-medium text-blue-700">Contextual AI</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Write smarter documents with contextual AI
              </h3>
              <p className="text-gray-700 mb-6 text-lg">
                DocGPT's AI understands your company's terminology, previous documents, and industry standards to create content that's perfectly tailored to your needs.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Learns from your existing content</span>
                    <p className="text-gray-500 text-sm">Automatically analyzes your uploaded documents to match your style and terminology</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Industry-specific knowledge</span>
                    <p className="text-gray-500 text-sm">Pre-trained on thousands of professional documents from your industry</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Real-time assistance</span>
                    <p className="text-gray-500 text-sm">Get suggestions as you write to improve clarity and impact</p>
                  </div>
                </li>
              </ul>
              
              <a href="#" className="text-indigo-600 font-medium flex items-center">
                See how contextual AI works
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            
            <div className="order-1 md:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl transform rotate-3"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-indigo-100">
                <Image 
                  src={Chatbox} 
                  alt="DocGPT AI Writing Assistant" 
                  className="w-full h-auto"
                />
                
                {/* Interactive Demo Overlay */}
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center">
                  <a href="#" className="text-indigo-600 text-sm font-medium flex items-center">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                    Watch demo
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature Showcase 2 - Smart Templates */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl transform -rotate-2"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-indigo-100">
                <Image 
                  src={Templates} 
                  alt="DocGPT Templates" 
                  className="w-full h-auto"
                />
                
                {/* Live Template Counter */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg py-2 px-3 shadow-lg border border-purple-100 flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">100+ ready-to-use templates</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-3 inline-flex items-center bg-purple-100 rounded-full py-1 px-3">
                <div className="h-2 w-2 rounded-full bg-purple-600 mr-2"></div>
                <span className="text-sm font-medium text-purple-700">Smart Templates</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Start with powerful templates, customized for your needs
              </h3>
              <p className="text-gray-700 mb-6 text-lg">
                Kickstart your documents with professionally designed templates for every business need, from proposals to reports and more.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">100+ professional templates</span>
                    <p className="text-gray-500 text-sm">PRDs, memos, proposals, reports, and more—all designed by experts</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Custom branding options</span>
                    <p className="text-gray-500 text-sm">Add your logo, colors, and fonts to maintain brand consistency</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Save and reuse your templates</span>
                    <p className="text-gray-500 text-sm">Create custom templates that match your company's standards</p>
                  </div>
                </li>
              </ul>
              
              <a href="#" className="text-indigo-600 font-medium flex items-center">
                Browse template gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Quick CTA - Mid-page */}
          <div className="mt-20 text-center">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium text-lg">
              <Link href="/signup">Start Creating Documents</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section - Social Proof */}
      <section className="w-full py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by teams everywhere
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See why thousands of professionals rely on DocGPT for their document needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative">
              <div className="flex items-center mb-2 text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-700 mb-6 italic">
                "DocGPT cut our document creation time by 70%. What used to take us hours now takes minutes, and the quality is even better."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mr-4">
                  SL
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sarah Liu</h4>
                  <p className="text-gray-500 text-sm">Marketing Director, Acme Inc.</p>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-indigo-100 rounded-full p-1">
                <Quote className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative">
              <div className="flex items-center mb-2 text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The smart templates alone are worth the price. We now have consistent, on-brand documents across our entire organization."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl mr-4">
                  JR
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">James Rodriguez</h4>
                  <p className="text-gray-500 text-sm">CEO, Startup Labs</p>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-purple-100 rounded-full p-1">
                <Quote className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative">
              <div className="flex items-center mb-2 text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Our team collaboration has improved dramatically. Real-time editing and AI suggestions make our documents much more effective."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                  AP
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Ava Patel</h4>
                  <p className="text-gray-500 text-sm">Product Manager, TechCorp</p>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-blue-100 rounded-full p-1">
                <Quote className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section - Social Proof */}
      <section className="w-full py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">10x</div>
              <p className="text-gray-700">Faster document creation</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">500k+</div>
              <p className="text-gray-700">Documents created</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">98%</div>
              <p className="text-gray-700">Customer satisfaction</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">20k+</div>
              <p className="text-gray-700">Happy users</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Teaser - Conversion Element */}
      <section className="w-full py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works for your team. Always start with a free trial.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Free</span>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-gray-600 mt-4">Perfect for individuals just getting started</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">10 documents per month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Basic AI assistance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Access to 10+ templates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Email support</span>
                </li>
              </ul>
              
              <Button className="w-full bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg">
                <Link href="/signup" className="block py-1">Get Started Free</Link>
              </Button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 relative transform md:scale-105 z-10">
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider">Most Popular</span>
              </div>
              
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pro</span>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-gray-600 mt-4">For professionals who need more power</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited documents</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Advanced AI features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Access to 50+ templates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Real-time collaboration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">
                <Link href="/signup?plan=pro" className="block py-1">Start 14-Day Free Trial</Link>
              </Button>
            </div>
            
            {/* Team Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Team</span>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">$79</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-gray-600 mt-4">For teams that need to collaborate</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">5 team members</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Team templates library</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Custom branding</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Dedicated support</span>
                </li>
              </ul>
              
              <Button className="w-full bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg">
                <Link href="/signup?plan=team" className="block py-1">Contact Sales</Link>
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-8 text-gray-600">
            Need a custom plan? <a href="#" className="text-indigo-600 font-medium">Contact our sales team</a>
          </div>
        </div>
      </section>
      
      {/* Final CTA - Conversion Element */}
      <section className="w-full py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your document workflow?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join thousands of professionals who are creating better documents in half the time.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3 rounded-lg font-medium text-lg w-full">
              <Link href="/signup">Try DocGPT Free</Link>
            </Button>
            <Button className="bg-transparent border border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium text-lg w-full">
              <Link href="/contact">Schedule Demo</Link>
            </Button>
          </div>
          
          <div className="mt-8 space-y-4 text-indigo-100">
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-indigo-200 mr-2" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-indigo-200 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-indigo-200 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section - Address Objections */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about DocGPT and how it can help your team.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How does DocGPT differ from other AI writing tools?</h3>
              <p className="text-gray-700">
                DocGPT combines the precision of Cursor with the collaborative features of Google Docs. It's specifically designed for professional business documents with industry-specific training and templates.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How secure is my data with DocGPT?</h3>
              <p className="text-gray-700">
                We take security seriously. All your documents are encrypted at rest and in transit. We never share your data with third parties, and you maintain ownership of all your content.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I import my existing documents?</h3>
              <p className="text-gray-700">
                Yes! DocGPT supports importing documents from Word, Google Docs, and other formats. Our AI will analyze your existing documents to better match your style and terminology.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How many team members can I add?</h3>
              <p className="text-gray-700">
                Our Team plan includes 5 team members by default. For larger teams, we offer custom Enterprise plans with unlimited team members and additional features.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">What happens after my free trial ends?</h3>
              <p className="text-gray-700">
                After your 14-day trial, you can choose to upgrade to one of our paid plans or continue with our Free plan with limited features. We'll send you a reminder before your trial ends.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a href="#" className="text-indigo-600 font-medium">Visit our help center &rarr;</a>
          </div>
        </div>
      </section>
    </div>
  );
}