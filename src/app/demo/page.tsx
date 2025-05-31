"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductBrainDemo() {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const questions = [
    "What features do you suggest building to the onboarding journey based on the most recent UXR done?",
    "Who owns the payment infrastructure redesign and what's the timeline?",
    "What would be the impact of deprecating our v1 API endpoints?",
    "Can you write a PRD for adding sorting and filtering to our product catalog?"
  ];

  const thinkingProcesses = [
    {
      steps: [
        { type: 'search', text: 'Searching for current onboarding flow documentation...', files: ['onboarding-flow-v3.prd', 'user-onboarding-wireframes.fig', 'mobile-onboarding-screens.png'] },
        { type: 'read', text: 'Analyzing onboarding flow screenshots and wireframes...', content: 'Current flow: 7 steps, email verification → profile setup → workspace creation → team invites → tutorial → first project → success. Drop-off points identified at steps 3 and 5.' },
        { type: 'commentary', text: 'Interesting - I can see the current flow is quite linear and front-loads a lot of setup. Let me check what users actually think about this experience...' },
        { type: 'search', text: 'Looking for most recent UX research on onboarding...', files: ['onboarding-uxr-december-2024.pdf', 'user-interviews-onboarding-q4.md', 'onboarding-usability-test-results.xlsx'] },
        { type: 'read', text: 'Reading December 2024 UXR findings...', content: 'Key insights: 67% users confused by workspace setup, 43% abandon at team invites, 78% want to see value before setup, 89% prefer progressive disclosure' },
        { type: 'commentary', text: 'This confirms my suspicion - users want value first, setup later. The 78% wanting to see value before setup is a clear signal. Now let me understand what\'s technically possible...' },
        { type: 'search', text: 'Reviewing related onboarding PRDs and technical constraints...', files: ['onboarding-backend-architecture.md', 'progressive-onboarding-spike.md', 'user-activation-metrics.json'] },
        { type: 'read', text: 'Understanding technical feasibility and current metrics...', content: 'Backend supports progressive user creation, current activation rate 34%, time-to-first-value averages 12 minutes, A/B testing infrastructure ready' },
        { type: 'commentary', text: 'Great! The backend already supports progressive creation, so we\'re not blocked technically. 34% activation is definitely room for improvement. Let me think through the best approach...' },
        { type: 'think', text: 'Synthesizing UXR insights with technical capabilities...', content: 'Users want immediate value but current flow front-loads setup. Technical architecture allows for deferred account completion. Need to balance user desire for quick wins with business need for complete profiles.' },
        { type: 'commentary', text: 'The pattern is clear - we need to flip the script from "setup then value" to "value then setup". Let me brainstorm some specific solutions...' },
        { type: 'think', text: 'Brainstorming feature ideas based on research patterns...', content: 'Potential solutions: 1) Guest mode with value-first experience, 2) Smart defaults to reduce cognitive load, 3) Contextual help during complex steps, 4) Social proof integration, 5) Progressive profile completion' },
        { type: 'commentary', text: 'I have 5 solid ideas, but I need to prioritize based on impact vs effort. Let me think through which ones will move the needle most...' },
        { type: 'synthesize', text: 'Developing detailed requirements for top 3 features...', content: 'Prioritizing based on impact vs effort: Guest mode (high impact, medium effort), Smart defaults (medium impact, low effort), Progressive completion (high impact, high effort)' }
      ],
      answer: {
        text: "Based on the December 2024 UXR findings, I recommend building these 3 features to improve onboarding:\n\n## 1. Guest Mode with Immediate Value\n**Problem**: 78% of users want to see value before completing setup\n**Solution**: Allow users to create and edit a sample project without account creation\n**Requirements**:\n• Anonymous session management for 24 hours\n• Pre-populated sample project with realistic data\n• Seamless conversion to full account when ready\n• Progress preservation during account creation\n\n## 2. Smart Defaults with Context\n**Problem**: 67% confusion during workspace setup, too many decisions upfront\n**Solution**: Intelligent defaults based on company domain and role detection\n**Requirements**:\n• Company domain lookup for workspace naming\n• Role-based template suggestions (PM, Designer, Engineer)\n• One-click workspace creation with smart defaults\n• Easy customization after initial setup\n\n## 3. Progressive Profile Completion\n**Problem**: 43% abandon at team invites step, overwhelming all-at-once approach\n**Solution**: Defer non-critical profile fields until contextually relevant\n**Requirements**:\n• Core profile: name, email, role only\n• Contextual prompts for additional info (team invites when creating second project)\n• Completion incentives tied to feature unlocks\n• Background completion tracking and gentle nudges\n\n**Expected Impact**: Based on similar implementations, these changes could improve activation rate from 34% to 52-58% and reduce time-to-first-value from 12 to 4-6 minutes.",
        sources: ['onboarding-uxr-december-2024.pdf', 'onboarding-flow-v3.prd', 'user-onboarding-wireframes.fig', 'onboarding-backend-architecture.md', 'user-activation-metrics.json']
      }
    },
    {
      steps: [
        { type: 'search', text: 'Searching for payment infrastructure project details...', files: ['project-assignments.xlsx', 'payment-redesign-prd.md', 'team-roadmap-2025.json'] },
        { type: 'read', text: 'Reading payment-redesign-prd.md...', content: 'Project lead: Sarah Chen (Senior PM), Tech lead: Marcus Rodriguez, Design: Alex Kim' },
        { type: 'commentary', text: 'Good, I found the core team. Sarah\'s leading this which makes sense given her payments background. Let me check the timeline and current status...' },
        { type: 'read', text: 'Checking team-roadmap-2025.json...', content: 'Payment Infrastructure Redesign - Phase 1: Q1 2025, Phase 2: Q2 2025, Full migration: Q3 2025' },
        { type: 'commentary', text: 'Ambitious timeline - full migration by Q3. That\'s a big undertaking. I should check how things are actually progressing...' },
        { type: 'search', text: 'Looking for recent status updates...', files: ['sprint-23-retro.md', 'payment-team-standup-notes.md'] },
        { type: 'read', text: 'Analyzing sprint-23-retro.md...', content: 'Current status: Architecture design 90% complete, Stripe integration POC successful, 2-week delay due to security review' },
        { type: 'commentary', text: 'Ah, there\'s a delay due to security review - that\'s actually pretty common for payment systems. Better to be thorough. Let me compile this into a clear status update...' },
        { type: 'synthesize', text: 'Compiling ownership and timeline information...', content: 'Clear ownership structure, timeline adjusted for security requirements' }
      ],
      answer: {
        text: "The payment infrastructure redesign is owned by **Sarah Chen** (Senior PM) with **Marcus Rodriguez** as Tech Lead and **Alex Kim** on Design.\n\n**Current Timeline:**\n• **Q1 2025**: Phase 1 - New payment service architecture\n• **Q2 2025**: Phase 2 - Merchant dashboard & reporting\n• **Q3 2025**: Full migration from legacy system\n\n**Current Status:**\n• Architecture design: 90% complete\n• Stripe integration POC: ✅ Successful\n• Security review: In progress (causing 2-week delay)\n\n**Key milestones:**\n• Jan 15: Architecture review\n• Feb 1: Phase 1 development start\n• Mar 30: Phase 1 launch to 10% users\n\nNote: Timeline has been adjusted by 2 weeks due to additional security requirements identified during review.",
        sources: ['payment-redesign-prd.md', 'team-roadmap-2025.json', 'sprint-23-retro.md', 'project-assignments.xlsx']
      }
    },
    {
      steps: [
        { type: 'search', text: 'Searching for v1 API usage and dependencies...', files: ['api-deprecation-analysis.md', 'client-integrations-audit.xlsx', 'mobile-app-dependencies.json'] },
        { type: 'read', text: 'Reading api-deprecation-analysis.md...', content: 'v1 endpoints: 47 total, 31 still in use, 2.3M daily requests, 847 unique API keys' },
        { type: 'commentary', text: 'Wow, 2.3M daily requests is significant usage. 31 out of 47 endpoints still active means this API is far from dead. I need to understand who\'s using this...' },
        { type: 'read', text: 'Analyzing client-integrations-audit.xlsx...', content: 'Enterprise clients using v1: 23 companies, $4.2M ARR at risk, Top users: Acme Corp, TechStart, GlobalRetail' },
        { type: 'commentary', text: '$4.2M ARR at risk - that\'s substantial revenue. This isn\'t just a technical decision anymore, it\'s a business risk. Let me check our internal dependencies too...' },
        { type: 'search', text: 'Checking internal dependencies...', files: ['mobile-app-v3.2-config.json', 'admin-dashboard-services.md', 'billing-service-deps.yaml'] },
        { type: 'read', text: 'Scanning mobile-app-v3.2-config.json...', content: 'Mobile apps v2.0-v3.2 hardcoded to v1/auth and v1/user endpoints, 340K daily active users affected' },
        { type: 'commentary', text: 'This is getting complex - we\'d break our own mobile app! 340K users would be impacted. This definitely needs a migration strategy, not a hard cutoff...' },
        { type: 'think', text: 'Calculating business and technical impact...', content: 'Revenue risk: $4.2M, User impact: 340K mobile + 23 enterprise, Technical debt: 3 internal services need refactor' },
        { type: 'commentary', text: 'The numbers are clear - this is high-risk. I need to recommend a phased approach that protects revenue and users while still moving us forward...' },
        { type: 'synthesize', text: 'Preparing comprehensive impact assessment...', content: 'High risk deprecation, needs phased approach with migration support' }
      ],
      answer: {
        text: "Deprecating v1 API endpoints would have significant impact:\n\n**Business Impact:**\n• **Revenue at risk**: $4.2M ARR (23 enterprise clients)\n• **Users affected**: 340K mobile users + enterprise integrations\n• **Top clients impacted**: Acme Corp ($1.2M), TechStart ($800K), GlobalRetail ($600K)\n\n**Technical Impact:**\n• **31 active endpoints** processing 2.3M requests/day\n• **Mobile apps v2.0-v3.2**: Hardcoded dependencies on v1/auth, v1/user\n• **Internal services**: Billing service, admin dashboard, legacy webhooks\n\n**Recommended Migration Plan:**\n1. **Phase 1** (3 months): Build v1→v2 adapter layer\n2. **Phase 2** (6 months): Migrate enterprise clients with white-glove support\n3. **Phase 3** (3 months): Force mobile app updates\n4. **Phase 4** (3 months): Sunset with 6-month deprecation notice\n\n**Critical**: Direct deprecation would break production for 340K users and risk $4.2M ARR. Requires 12-15 month phased approach.",
        sources: ['api-deprecation-analysis.md', 'client-integrations-audit.xlsx', 'mobile-app-v3.2-config.json', 'billing-service-deps.yaml']
      }
    },
    {
      steps: [
        { type: 'search', text: 'Searching for current product catalog UI and screenshots...', files: ['product-catalog-current.fig', 'mobile-catalog-screens.png', 'catalog-wireframes-v2.sketch'] },
        { type: 'read', text: 'Analyzing product catalog UI from Figma files...', content: 'Current catalog shows grid view with 20 products per page, basic search bar, no filtering options. Users scroll endlessly. Mobile view is cramped.' },
        { type: 'commentary', text: 'No filtering options at all? That explains user frustration. Endless scrolling through 20 products at a time is painful. Let me understand our users better...' },
        { type: 'search', text: 'Looking for user personas and catalog usage patterns...', files: ['user-personas-2024.md', 'catalog-analytics-q4.json', 'customer-segments.xlsx'] },
        { type: 'read', text: 'Reading user personas and behavior data...', content: 'Three main personas: Price-conscious browsers (45%), Brand loyalists (30%), Feature seekers (25%). Average session has 8.3 searches, 67% bounce when can\'t find products quickly.' },
        { type: 'commentary', text: '8.3 searches per session and 67% bounce rate? Users are clearly struggling to find what they want. Different personas will need different filtering approaches...' },
        { type: 'search', text: 'Searching for UX research on sorting and filtering needs...', files: ['catalog-uxr-november-2024.pdf', 'user-interviews-filtering.md', 'competitor-analysis-filters.xlsx'] },
        { type: 'read', text: 'Analyzing UXR findings on filtering preferences...', content: 'Top requested filters: Price range (89%), Brand (76%), Ratings (71%), Availability (68%), Category (65%). Users want multi-select filters and to see result counts.' },
        { type: 'commentary', text: 'Perfect! Clear user demand - 89% want price filtering. Multi-select and result counts are table stakes. Now I need to check if our data supports this...' },
        { type: 'search', text: 'Looking for product data structure and available attributes...', files: ['product-schema.json', 'catalog-api-docs.md', 'inventory-data-model.sql'] },
        { type: 'read', text: 'Understanding data availability for filtering...', content: 'Product table has: price, brand_id, category_id, avg_rating, stock_status, color, size, material, release_date. All indexed for fast queries. ElasticSearch available.' },
        { type: 'commentary', text: 'Excellent - we have all the data we need and it\'s already indexed. ElasticSearch means we can do real-time faceted search. Now let me check our PRD standards...' },
        { type: 'search', text: 'Finding PRD templates and format guidelines...', files: ['prd-template-standard.md', 'product-spec-guidelines.docx', 'example-search-prd.md'] },
        { type: 'read', text: 'Reviewing PRD format standards...', content: 'Standard format: Executive Summary, Problem Statement, User Stories, Success Metrics, Technical Requirements, Design Specs, Timeline, Risks. Must include mockups.' },
        { type: 'commentary', text: 'Got the template. I have all the pieces now - user needs, technical capabilities, and format requirements. Time to synthesize this into a strategy...' },
        { type: 'think', text: 'Synthesizing research into filtering strategy...', content: 'Need faceted search with real-time updates. Priority on price/brand/rating filters. Progressive disclosure for advanced filters. Mobile-first design essential.' },
        { type: 'commentary', text: 'Strategy is clear - start with the high-demand filters and make it mobile-friendly. Now let me write this up as a proper PRD...' },
        { type: 'synthesize', text: 'Generating comprehensive PRD document...', content: 'Creating PRD with user stories, technical specs, success metrics, and implementation phases based on research findings and company standards.' }
      ],
      answer: {
        text: "I've analyzed our current catalog UI, user research, and data capabilities. Here's a comprehensive PRD for sorting and filtering:\n\n## Product Requirements Document: Catalog Sorting & Filtering\n\n### Executive Summary\nImplement a comprehensive sorting and filtering system for our product catalog to reduce bounce rate by 40% and increase conversion by 25%.\n\n### Problem Statement\nBased on <button class=\"text-blue-600 underline hover:text-blue-800 cursor-pointer\">catalog-analytics-q4.json</button>:\n• 67% of users bounce when unable to find products quickly\n• Average user performs 8.3 searches per session\n• Mobile users have 2.3x higher abandonment rate\n\n### User Stories\n**Price-Conscious Browsers (45% of users)**\n• As a budget shopper, I want to filter by price range so I can see only products I can afford\n• As a deal seeker, I want to sort by discount percentage to find the best deals\n\n**Brand Loyalists (30% of users)**\n• As a brand enthusiast, I want to filter by my favorite brands\n• As a quality seeker, I want to sort by customer ratings\n\n**Feature Seekers (25% of users)**\n• As a specific shopper, I want to filter by multiple attributes (color, size, material)\n• As a researcher, I want to save my filter combinations\n\n### Technical Requirements\nBased on <button class=\"text-blue-600 underline hover:text-blue-800 cursor-pointer\">product-schema.json</button> and <button class=\"text-blue-600 underline hover:text-blue-800 cursor-pointer\">catalog-api-docs.md</button>:\n\n**Core Filters:**\n• Price Range (slider with min/max inputs)\n• Brand (multi-select with search)\n• Rating (4+ stars, 3+ stars, etc.)\n• Availability (In Stock, Ships in 1-2 days)\n• Category (hierarchical navigation)\n\n**Sorting Options:**\n• Relevance (default)\n• Price: Low to High / High to Low\n• Customer Rating\n• Newest First\n• Best Sellers\n\n**Technical Implementation:**\n• Use existing ElasticSearch cluster for faceted search\n• Real-time result count updates\n• URL state management for shareable filtered views\n• Maximum 100ms response time for filter updates\n\n### Success Metrics\n• Reduce catalog bounce rate from 67% to 40%\n• Increase products viewed per session from 12 to 20\n• Improve mobile conversion rate by 35%\n• Achieve <2 seconds page load with filters applied\n\n### Timeline\n**Phase 1 (4 weeks)**: Basic filters (price, brand, availability)\n**Phase 2 (3 weeks)**: Advanced filters and sorting\n**Phase 3 (2 weeks)**: Mobile optimization and saved filters\n\n<button class=\"bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center\">\n  <svg class=\"w-4 h-4 mr-2\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n    <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" />\n  </svg>\n  View Full PRD Document\n</button>",
        sources: ['product-catalog-current.fig', 'catalog-uxr-november-2024.pdf', 'product-schema.json', 'prd-template-standard.md', 'catalog-analytics-q4.json']
      }
    }
  ];

  const handleQuestionClick = (index: number) => {
    setSelectedQuestion(index);
    setShowThinking(true);
    setThinkingStep(0);
    setShowAnswer(false);
    setIsTyping(true);
  };

  useEffect(() => {
    if (showThinking && selectedQuestion !== null && thinkingStep < thinkingProcesses[selectedQuestion].steps.length) {
      const currentStep = thinkingProcesses[selectedQuestion].steps[thinkingStep];
      let delay = 2000; // default delay
      
      // Different delays based on step type
      switch (currentStep.type) {
        case 'search':
          delay = 1500; // Quick search
          break;
        case 'read':
          delay = 2500; // Reading takes longer
          break;
        case 'think':
          delay = 3000; // Thinking takes the longest
          break;
        case 'synthesize':
          delay = 2200; // Synthesis is moderately long
          break;
      }
      
      const timer = setTimeout(() => {
        setThinkingStep(thinkingStep + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else if (showThinking && selectedQuestion !== null && thinkingStep === thinkingProcesses[selectedQuestion].steps.length) {
      const timer = setTimeout(() => {
        setShowAnswer(true);
        setIsTyping(false);
      }, 1800); // Slightly longer pause before final answer
      return () => clearTimeout(timer);
    }
  }, [showThinking, thinkingStep, selectedQuestion]);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'search':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'read':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'commentary':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'think':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'synthesize':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-white font-semibold text-lg">ProductBrain</h2>
            <p className="text-blue-100 text-sm">Your AI Product Assistant</p>
          </div>

          {/* Chat Messages */}
          <div className="h-[600px] overflow-y-auto bg-gray-50 p-6">
            {/* Welcome Message */}
            <div className="mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-200 px-4 py-3">
                    <p className="text-gray-800">
                      Hi! I'm ProductBrain. I've read and understood all your product documentation, PRDs, design files, and engineering specs. Ask me anything about your product!
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Try one of these questions to see how I think:
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Suggestions */}
            {selectedQuestion === null && (
              <div className="space-y-3 mb-8">
                {questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(index)}
                    className="w-full text-left bg-white hover:bg-blue-50 border border-gray-300 hover:border-blue-400 rounded-lg px-4 py-3 transition-all duration-200"
                  >
                    <p className="text-gray-800 font-medium">{question}</p>
                  </button>
                ))}
              </div>
            )}

            {/* User Question */}
            {selectedQuestion !== null && (
              <div className="mb-6">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg rounded-br-none px-4 py-3 max-w-md">
                    <p>{questions[selectedQuestion]}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Thinking Process */}
            {showThinking && selectedQuestion !== null && (
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-200 px-4 py-3">
                      <div className="space-y-3">
                        {thinkingProcesses[selectedQuestion].steps.slice(0, thinkingStep).map((step, index) => (
                          <div key={index} className={`${step.type === 'think' ? 'ml-6 my-2' : 'my-1'}`}>
                            <div className="flex items-start space-x-3">
                              {step.type !== 'commentary' && (
                                <div className={`mt-0.5 flex-shrink-0 ${
                                  step.type === 'search' ? 'text-blue-500' : 
                                  step.type === 'read' ? 'text-emerald-500' : 
                                  step.type === 'think' ? 'text-purple-500' : 
                                  'text-amber-500'
                                }`}>
                                  {getStepIcon(step.type)}
                                </div>
                              )}
                              <div className="flex-1">
                                <p className={`${
                                  step.type === 'commentary' ? 'text-gray-600 leading-relaxed' :
                                  step.type === 'think' ? 'text-gray-500 text-xs' :
                                  'text-gray-800'
                                }`}>
                                  {step.text}
                                </p>
                                {step.files && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {step.files.map((file, fileIndex) => (
                                      <span key={fileIndex} className="inline-flex items-center px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 rounded cursor-pointer transition-colors">
                                        <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        {file}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {step.content && step.type !== 'commentary' && (
                                  <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{step.content}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isTyping && thinkingStep < thinkingProcesses[selectedQuestion].steps.length && (
                          <div className="flex items-center space-x-2 ml-7 mt-2">
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Answer */}
            {showAnswer && selectedQuestion !== null && (
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-200 px-4 py-3">
                      <div className="text-gray-800">
                        {selectedQuestion === 0 ? (
                          // Special formatting for the onboarding question
                          <div className="space-y-4">
                            <p>Based on the <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">December 2024 UXR findings</button>, I recommend building these 3 features to improve onboarding:</p>
                            
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Guest Mode with Immediate Value</h3>
                                <p className="mb-2"><strong>Problem</strong>: 78% of users want to see value before completing setup (source: <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">onboarding-uxr-december-2024.pdf</button>)</p>
                                <p className="mb-2"><strong>Solution</strong>: Allow users to create and edit a sample project without account creation</p>
                                <p className="font-semibold mb-1">Requirements:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                  <li>Anonymous session management for 24 hours</li>
                                  <li>Pre-populated sample project with realistic data</li>
                                  <li>Seamless conversion to full account when ready</li>
                                  <li>Progress preservation during account creation (per <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">onboarding-backend-architecture.md</button>)</li>
                                </ul>
                              </div>
                              
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">2. Smart Defaults with Context</h3>
                                <p className="mb-2"><strong>Problem</strong>: 67% confusion during workspace setup, too many decisions upfront</p>
                                <p className="mb-2"><strong>Solution</strong>: Intelligent defaults based on company domain and role detection</p>
                                <p className="font-semibold mb-1">Requirements:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                  <li>Company domain lookup for workspace naming</li>
                                  <li>Role-based template suggestions (PM, Designer, Engineer) - see <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">user-onboarding-wireframes.fig</button></li>
                                  <li>One-click workspace creation with smart defaults</li>
                                  <li>Easy customization after initial setup</li>
                                </ul>
                              </div>
                              
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">3. Progressive Profile Completion</h3>
                                <p className="mb-2"><strong>Problem</strong>: 43% abandon at team invites step, overwhelming all-at-once approach</p>
                                <p className="mb-2"><strong>Solution</strong>: Defer non-critical profile fields until contextually relevant</p>
                                <p className="font-semibold mb-1">Requirements:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                  <li>Core profile: name, email, role only</li>
                                  <li>Contextual prompts for additional info (team invites when creating second project)</li>
                                  <li>Completion incentives tied to feature unlocks</li>
                                  <li>Background completion tracking and gentle nudges</li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                              <p className="font-semibold text-blue-900">Expected Impact</p>
                              <p className="text-blue-800">Based on similar implementations and current metrics from <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">user-activation-metrics.json</button>, these changes could improve activation rate from 34% to 52-58% and reduce time-to-first-value from 12 to 4-6 minutes.</p>
                            </div>
                          </div>
                        ) : selectedQuestion === 1 ? (
                          // Special formatting for the payment infrastructure question
                          <div className="space-y-4">
                            <p>The payment infrastructure redesign is owned by <strong>Sarah Chen</strong> (Senior PM) with <strong>Marcus Rodriguez</strong> as Tech Lead and <strong>Alex Kim</strong> on Design (per <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">payment-redesign-prd.md</button>).</p>
                            
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">Current Timeline:</p>
                              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                <li><strong>Q1 2025</strong>: Phase 1 - New payment service architecture</li>
                                <li><strong>Q2 2025</strong>: Phase 2 - Merchant dashboard & reporting</li>
                                <li><strong>Q3 2025</strong>: Full migration from legacy system</li>
                              </ul>
                              <p className="text-sm text-gray-600 mt-2">Source: <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">team-roadmap-2025.json</button></p>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">Current Status:</p>
                              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                <li>Architecture design: 90% complete</li>
                                <li>Stripe integration POC: ✅ Successful</li>
                                <li>Security review: In progress (causing 2-week delay)</li>
                              </ul>
                              <p className="text-sm text-gray-600 mt-2">Latest update: <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">sprint-23-retro.md</button></p>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">Key milestones:</p>
                              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                <li>Jan 15: Architecture review</li>
                                <li>Feb 1: Phase 1 development start</li>
                                <li>Mar 30: Phase 1 launch to 10% users</li>
                              </ul>
                            </div>
                            
                            <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                              <p className="font-semibold text-amber-900">Note</p>
                              <p className="text-amber-800">Timeline has been adjusted by 2 weeks due to additional security requirements identified during review.</p>
                            </div>
                          </div>
                        ) : selectedQuestion === 3 ? (
                          // Special formatting for the PRD question
                          <div className="space-y-4">
                            <p>I've analyzed our current catalog UI, user research, and data capabilities. Here's a comprehensive PRD for sorting and filtering:</p>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <h2 className="text-xl font-bold text-gray-900 mb-3">Product Requirements Document: Catalog Sorting & Filtering</h2>
                              
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
                                  <p className="text-gray-700">Implement a comprehensive sorting and filtering system for our product catalog to reduce bounce rate by 40% and increase conversion by 25%.</p>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-2">Problem Statement</h3>
                                  <p className="text-gray-700 mb-2">Based on <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">catalog-analytics-q4.json</button>:</p>
                                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>67% of users bounce when unable to find products quickly</li>
                                    <li>Average user performs 8.3 searches per session</li>
                                    <li>Mobile users have 2.3x higher abandonment rate</li>
                                  </ul>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-2">User Stories</h3>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="font-medium text-gray-800">Price-Conscious Browsers (45% of users)</p>
                                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                                        <li>As a budget shopper, I want to filter by price range so I can see only products I can afford</li>
                                        <li>As a deal seeker, I want to sort by discount percentage to find the best deals</li>
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800">Brand Loyalists (30% of users)</p>
                                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                                        <li>As a brand enthusiast, I want to filter by my favorite brands</li>
                                        <li>As a quality seeker, I want to sort by customer ratings</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-2">Technical Requirements</h3>
                                  <p className="text-gray-700 mb-2">Based on <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">product-schema.json</button> and <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">catalog-api-docs.md</button>:</p>
                                  
                                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                                    <div>
                                      <p className="font-medium text-gray-800 mb-1">Core Filters:</p>
                                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                                        <li>Price Range (slider with min/max inputs)</li>
                                        <li>Brand (multi-select with search)</li>
                                        <li>Rating (4+ stars, 3+ stars, etc.)</li>
                                        <li>Availability (In Stock, Ships in 1-2 days)</li>
                                        <li>Category (hierarchical navigation)</li>
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800 mb-1">Sorting Options:</p>
                                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                                        <li>Relevance (default)</li>
                                        <li>Price: Low to High / High to Low</li>
                                        <li>Customer Rating</li>
                                        <li>Newest First</li>
                                        <li>Best Sellers</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-2">Success Metrics</h3>
                                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                    <li>Reduce catalog bounce rate from 67% to 40%</li>
                                    <li>Increase products viewed per session from 12 to 20</li>
                                    <li>Improve mobile conversion rate by 35%</li>
                                    <li>Achieve &lt;2 seconds page load with filters applied</li>
                                  </ul>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
                                  <div className="space-y-1 text-gray-700">
                                    <p><strong>Phase 1 (4 weeks)</strong>: Basic filters (price, brand, availability)</p>
                                    <p><strong>Phase 2 (3 weeks)</strong>: Advanced filters and sorting</p>
                                    <p><strong>Phase 3 (2 weeks)</strong>: Mobile optimization and saved filters</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-center">
                              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center transform hover:scale-105 transition-all duration-200 shadow-lg">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Full PRD Document
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Special formatting for the API deprecation question
                          <div className="space-y-4">
                            <p>Deprecating v1 API endpoints would have significant impact based on analysis from <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">api-deprecation-analysis.md</button>:</p>
                            
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">Business Impact:</p>
                              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                <li><strong>Revenue at risk</strong>: $4.2M ARR (23 enterprise clients from <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">client-integrations-audit.xlsx</button>)</li>
                                <li><strong>Users affected</strong>: 340K mobile users + enterprise integrations</li>
                                <li><strong>Top clients impacted</strong>: Acme Corp ($1.2M), TechStart ($800K), GlobalRetail ($600K)</li>
                              </ul>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">Technical Impact:</p>
                              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                <li><strong>31 active endpoints</strong> processing 2.3M requests/day</li>
                                <li><strong>Mobile apps v2.0-v3.2</strong>: Hardcoded dependencies on v1/auth, v1/user</li>
                                <li><strong>Internal services</strong>: Billing service, admin dashboard, legacy webhooks</li>
                              </ul>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">Recommended Migration Plan:</p>
                              <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4">
                                <li><strong>Phase 1</strong> (3 months): Build v1→v2 adapter layer</li>
                                <li><strong>Phase 2</strong> (6 months): Migrate enterprise clients with white-glove support</li>
                                <li><strong>Phase 3</strong> (3 months): Force mobile app updates</li>
                                <li><strong>Phase 4</strong> (3 months): Sunset with 6-month deprecation notice</li>
                              </ol>
                            </div>
                            
                            <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                              <p className="font-semibold text-red-900">Critical</p>
                              <p className="text-red-800">Direct deprecation would break production for 340K users and risk $4.2M ARR. Requires 12-15 month phased approach per <button className="text-blue-600 underline hover:text-blue-800 cursor-pointer">billing-service-deps.yaml</button>.</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {thinkingProcesses[selectedQuestion].answer.sources.map((source, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-50 text-xs text-blue-700 rounded hover:bg-blue-100 cursor-pointer">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Try Another Question */}
            {showAnswer && (
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setSelectedQuestion(null);
                    setShowThinking(false);
                    setThinkingStep(0);
                    setShowAnswer(false);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try Another Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 