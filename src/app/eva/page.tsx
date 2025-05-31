"use client"; // Add this directive to mark as a Client Component

import React from 'react';

// Placeholder for Icons
const PlaceholderIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
// Simple Logo Placeholders
const PlaceholderLogo = ({ name, className }: { name: string, className: string }) => (
  <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded p-2 ${className}`}>
    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{name}</span>
  </div>
);


export default function EvaPage() {
  // Basic state for email input - in a real app, you'd handle form submission
  // const [email, setEmail] = React.useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 dark:from-gray-900 dark:via-black dark:to-blue-950 text-gray-800 dark:text-white selection:bg-blue-200 dark:selection:bg-blue-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto mb-20 lg:mb-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Content - Left Column */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
                Your tasks, automated.
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto md:mx-0">
                Eva scans your apps and files for tasks and drafts intelligent responses so you can save hours of work. You stay in control by simply approving or rejecting each suggestion.
              </p>
              <div className="mt-10 max-w-xl mx-auto md:mx-0 flex flex-col sm:flex-row gap-4">
                <form className="flex flex-col sm:flex-row flex-grow" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="flex-grow px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
                  >
                    Notify&nbsp;Me
                  </button>
                </form>
                <a
                  href="/get-started"
                  className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap text-center"
                >
                  Get&nbsp;Started
                </a>
              </div>
            </div>
            
            {/* Image Content - Right Column */} 
            <div className="mt-10 md:mt-0">
                <img 
                    src="https://placehold.co/800x600/dbeafe/3b82f6?text=Hero+Image" 
                    alt="AI Assistant Visual"
                    className="rounded-lg shadow-xl w-full h-auto object-cover aspect-[4/3]"
                 />
            </div>
        </div>

        {/* Integration Logos Section */}
         <div className="text-center mb-20 lg:mb-32">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Integrates seamlessly with your workflow</p>
            <div className="flex justify-center items-center gap-8 lg:gap-12 flex-wrap">
                {/* Replace with actual logos */}
                <PlaceholderLogo name="Slack" className="h-10 w-24" />
                <PlaceholderLogo name="Gmail" className="h-10 w-24" />
                <PlaceholderLogo name="Google Calendar" className="h-10 w-32" />
                 {/* Add more logos if needed */} 
            </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 lg:mt-24">
           <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Stop Reacting, Start Achieving</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1: Unified Task Capture */}
            <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 transform hover:scale-105 transition-transform duration-300 flex flex-col">
              <div className="flex items-center mb-4">
                 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-4 flex-shrink-0">
                   <PlaceholderIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Never Miss a Task Again</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 grow">
                Connect Slack, Gmail & Calendar. Our AI meticulously scans for action items, requests, and deadlines buried in threads and invites.
              </p>
              <img src="https://placehold.co/600x400/e0f2fe/3b82f6?text=Task+Capture" alt="Connect Tools Feature Screenshot" className="rounded-md aspect-video object-cover mt-auto" />
            </div>

            {/* Feature 2: Intelligent Prioritization */}
            <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 transform hover:scale-105 transition-transform duration-300 flex flex-col">
               <div className="flex items-center mb-4">
                 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 mr-4 flex-shrink-0">
                    <PlaceholderIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Know What Matters Most</h3>
               </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 grow">
                Stop guessing. AI analyzes urgency, sender, keywords, and your schedule to rank tasks by true priority.
              </p>
              <img src="https://placehold.co/600x400/dcfce7/16a34a?text=AI+Prioritization" alt="AI Prioritization Feature Screenshot" className="rounded-md aspect-video object-cover mt-auto" />
            </div>

            {/* Feature 3: Daily Focused Plan */}
            <div className="p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 transform hover:scale-105 transition-transform duration-300 flex flex-col">
               <div className="flex items-center mb-4">
                 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 mr-4 flex-shrink-0">
                   <PlaceholderIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Clear Action Plan</h3>
               </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 grow">
                Start your day with a simple, actionable list. No more context switching – just focused execution, step-by-step.
              </p>
              <img src="https://placehold.co/600x400/f3e8ff/7e22ce?text=Daily+Plan" alt="Daily Action Plan Feature Screenshot" className="rounded-md aspect-video object-cover mt-auto" />
            </div>
          </div>
        </div>

        {/* Placeholder Image/Demo Section */}
        <div className="mt-20 lg:mt-32 text-center">
           <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">From Chaos to Clarity: See It In Action</h2>
           <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
             Imagine this dashboard cutting through the noise, giving you back hours of your week.
           </p>
           <img src="https://placehold.co/1200x675/e5e7eb/4b5563?text=Product+Dashboard+View" alt="Product Demo Screenshot" className="rounded-lg shadow-xl max-w-4xl mx-auto aspect-video object-cover" />
           {/* Quantifiable Benefit Placeholder */} 
           <p className="mt-8 text-lg font-medium text-gray-700 dark:text-gray-300">Early testers report saving <span className="font-bold text-blue-600 dark:text-blue-400">5+ hours</span> per week!</p>
        </div>

        {/* Social Proof/Testimonial Placeholder */}
        <div className="mt-20 lg:mt-32 text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-900 dark:text-gray-100">Stop Juggling, Start Doing.</h2>
          <blockquote className="max-w-3xl mx-auto text-lg italic text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-6">
            "My Slack and email were relentless. I constantly felt behind. This tool doesn't just list tasks, it tells me *what to focus on*. Game changer for managing my workload without needing a human assistant."
            <footer className="mt-4 block text-base not-italic text-gray-500 dark:text-gray-400">- Sarah K., Project Manager (Early Tester)</footer>
          </blockquote>
        </div>


        {/* Final CTA */}
        <div className="mt-20 lg:mt-32 text-center bg-gradient-to-r from-blue-700 to-teal-600 dark:from-blue-800 dark:to-teal-700 rounded-lg p-10 lg:p-16 max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Ready to Conquer Your Workday?</h2>
          <p className="text-lg text-blue-100 dark:text-blue-200 max-w-2xl mx-auto mb-8">
             Sign up now for exclusive early access and be one of the first to experience an AI assistant that *actually* makes you more productive. Limited spots available!
           </p>
           {/* Reusing email capture form for consistency, or could be just a button linking to top form */} 
           <form className="mt-10 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}> 
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <input 
                  type="email" 
                  placeholder="Enter your email again to confirm"
                  required
                  className="flex-grow px-5 py-3 rounded-lg border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-white text-gray-900 placeholder-gray-500"
                />
                <button 
                  type="submit" 
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-10 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-700 focus:ring-white whitespace-nowrap"
                >
                 Claim My Early Access Spot
                </button>
              </div>
               <p className="mt-3 text-sm text-blue-200 dark:text-blue-300">No spam, ever. Unsubscribe anytime.</p>
            </form>
        </div>

      </div>
    </div>
  );
} 