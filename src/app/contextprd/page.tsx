"use client";

import React, { useState } from 'react';

import Link from 'next/link';

export default function ProductBrainPage() {
  const [activeDemo, setActiveDemo] = useState(0);

  const demoConversations = [
    {
      messages: [
        {
          text: "What would break if we deprecated our legacy billing API?",
          time: "2:34 PM",
          type: "user"
        },
        {
          details: [
            "• **Mobile app v2.1-v3.2** - uses legacy endpoints for subscription management",
            "• **Admin dashboard** - invoice generation relies on /v1/billing/*",
            "• **Stripe webhook handler** - processes refunds via legacy API"
          ],
          sources: "billing-api-spec.md, mobile-integration.docs, admin-architecture.pdf",
          text: "Based on your documentation, deprecating the legacy billing API would impact:",
          time: "2:34 PM",
          type: "assistant"
        }
      ],
      title: "Dependency Analysis"
    },
    {
      messages: [
        {
          text: "Who owns the onboarding flow redesign project?",
          time: "2:35 PM",
          type: "user"
        },
        {
          sources: "onboarding-redesign-prd.md, team-assignments.xlsx",
          statusBox: {
            goal: "Reduce time-to-value from 7 days to 2 days",
            status: "In progress (Sprint 23)",
            target: "Q1 2025 launch"
          },
          text: "The onboarding flow redesign is owned by **Sarah Chen (PM)** with design support from **Alex Kim**.",
          time: "2:35 PM",
          type: "assistant"
        }
      ],
      title: "Project Ownership"
    },
    {
      messages: [
        {
          text: "Show me the user journey map for the checkout flow",
          time: "2:36 PM",
          type: "user"
        },
        {
          filePreview: {
            details: "5 steps • 3 decision points • 2 error states mapped",
            name: "checkout-journey-v3.fig"
          },
          insight: "Key insight: 23% drop-off at payment method selection. Recommendation: add Express Checkout option.",
          sources: "checkout-journey-v3.fig, analytics-report-Q4.pdf",
          text: "Found the checkout user journey map from your design files:",
          time: "2:36 PM",
          type: "assistant"
        }
      ],
      title: "Visual Content"
    },
    {
      messages: [
        {
          text: "What's the business impact if we delay the AI search feature?",
          time: "2:37 PM",
          type: "user"
        },
        {
          details: [
            "• **Revenue impact**: $2.3M ARR at risk from enterprise pipeline",
            "• **Competitive risk**: Allows competitors 6-month head start",
            "• **User satisfaction**: 34% of users specifically requested this feature"
          ],
          insight: "Alternative: Ship MVP with basic semantic search to capture 70% of value by original deadline.",
          sources: "ai-search-prd.md, enterprise-pipeline.xlsx, user-feedback-q4.json",
          text: "Based on your product roadmap and user research, delaying AI search would:",
          time: "2:37 PM",
          type: "assistant"
        }
      ],
      title: "Feature Impact"
    }
  ];

  return (
    <div className="font-sans antialiased text-gray-800">
      {/* HERO */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
            Get instant access to the most knowledgable PM at your company
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            ProductBrain reads, understands, and maps your company's entire product knowledge base, allowing you to chat with a PM that knows your company inside and out.
          </p>

          {/* Primary CTA - Updated with Design Partner Option */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
              <Link 
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-10 rounded-lg text-lg font-bold shadow-xl transform hover:scale-105 transition-all duration-200" 
                href="#waitlist"
              >
                Join the Waitlist
              </Link>
              
              <span className="text-gray-400 hidden sm:block">or</span>
              
              <Link 
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 px-10 rounded-lg text-lg font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-orange-300" 
                href="mailto:founder@contextprd.com?subject=Design%20Partner%20Application%20-%20[Your%20Company]"
              >
                Become a Design Partner ⭐
              </Link>
            </div>
          </div>

          {/* Demo image */}
          <div className="w-full max-w-4xl mx-auto aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl shadow-2xl flex items-center justify-center mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-gray-600 font-semibold text-lg">See ProductBrain in Action</p>
              <p className="text-sm text-gray-500 mt-1">Demo video coming soon</p>
            </div>
          </div>

          {/* What makes ProductBrain different */}
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Why ProductBrain beats every other tool</h2>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
              Unlike Glean, Notion AI, or Microsoft Copilot, ProductBrain was built specifically to give thoughtful answers to product questions
            </p>
            
            <div className="space-y-8 mb-16">
              {/* Card 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Understands UI Screenshots & Diagrams</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      High-fidelity multimodal embeddings capture visual context that text-only engines like Glean completely miss, allowing ProductBrain to use this visual context in search and file citations.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Maps Dependencies Automatically</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Our knowledge graph connects features, services, and owners automatically. Ask "What breaks if we sunset the Billing API?" and see every impacted component.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Card 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Gets Smarter Every Day</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Search quality improves daily as ProductBrain learns from your team's interactions. The most relevant answers automatically rise to the top.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Partner Section */}
            <section className="py-16 px-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl mb-16 border-2 border-orange-200">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-6">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Limited Design Partner Spots Available
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Don't just use ProductBrain. <span className="text-orange-600">Help build it.</span>
                </h2>
                
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Join an exclusive group of 10 forward-thinking product leaders who will shape ProductBrain's roadmap and get lifetime access.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-md">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">First Access</h3>
                    <p className="text-gray-600 text-sm">Get new features 30 days before anyone else</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-md">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Direct Line to Founders</h3>
                    <p className="text-gray-600 text-sm">Monthly calls with our team to shape the roadmap</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-md">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Lifetime Free Access</h3>
                    <p className="text-gray-600 text-sm">Never pay for ProductBrain, even after we launch</p>
                  </div>
                </div>

                <Link 
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white py-4 px-10 rounded-lg text-lg font-bold shadow-xl transform hover:scale-105 transition-all duration-200" 
                  href="mailto:founder@contextprd.com?subject=Design%20Partner%20Application%20-%20[Your%20Company]"
                >
                  Apply to be a Design Partner
                </Link>
                <p className="text-sm text-gray-600 mt-4">
                  Only 3 spots remaining • Application review within 48 hours
                </p>
              </div>
            </section>

            {/* Final CTA */}
            <div id="waitlist" className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-12 text-center text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to give your team a ProductBrain?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join the exclusive early access program. Free forever for the first 50 teams.
              </p>
              
              <div className="mb-8">
                <Link 
                  className="inline-block bg-white hover:bg-gray-100 text-blue-600 py-4 px-12 rounded-lg text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-200" 
                  href="mailto:founder@contextprd.com?subject=ProductBrain%20Early%20Access%20Request"
                >
                  Join the Waitlist
                </Link>
              </div>
              
              <div className="flex justify-center items-center space-x-8 text-blue-100">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                  </svg>
                  <span>5-minute setup</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                  </svg>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                  </svg>
                  <span>Free forever</span>
                </div>
              </div>
              
              <p className="text-sm mt-6 opacity-75">
                ⚡ Limited spots • 24-hour response guarantee
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 