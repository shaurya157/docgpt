"use client";

import React from 'react';
import Link from 'next/link';

export default function ContextPRDPage() {
  return (
    <div className="font-sans text-[#1a1a1a] leading-normal">
      {/* Hero */}
      <section className="bg-[#f5f8ff] py-[72px] px-6 max-w-[1080px] mx-auto text-center md:text-left">
        <span className="uppercase text-sm font-semibold text-[#ff7043] block mb-3 tracking-wider">
          Zero‑Risk Pilot
        </span>
        <h1 className="text-4xl md:text-5xl leading-tight font-bold mb-5">
          Ever wish your PRD would write itself? <br className="hidden md:inline" />Now it can.
        </h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto md:mx-0">
          ContextPRD is your AI copilot for Product Requirement Docs — trained on <em>your</em> internal documents to draft PRDs <strong>10× faster</strong>. Start our <strong>white‑glove, zero‑risk pilot</strong>: we build a private AI on your past PRDs and deliver a draft in one week. You pay only if it proves valuable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
          <Link 
            href="#contact" 
            className="inline-block bg-[#0056ff] hover:bg-[#0045d4] text-white py-4 px-8 rounded-lg font-semibold transition-colors text-lg shadow-md"
          >
            Start Free Pilot
          </Link>
          <Link
            href="#pilot-details"
            className="text-[#0056ff] font-semibold hover:underline mt-2"
          >
            Pilot details
          </Link>
          <Link 
            href="#how-it-works" 
            className="text-[#0056ff] font-semibold hover:underline"
          >
            Learn how the pilot works
          </Link>
        </div>
        <p className="text-sm text-gray-600 mt-6">
          Free onboarding & setup • No credit card required • Pay only if you see significant value.
        </p>
      </section>

      {/* Proof bar */}
      <section className="py-8 px-6 bg-[#0e1a46] text-white text-center">
        <p className="text-base m-0">
          Trusted by product leaders from companies like <strong>Acme SaaS</strong>, <strong>RocketBank</strong> &amp; <strong>ZenCommerce</strong>
        </p>
      </section>

      {/* Benefits */}
      <section className="py-[72px] px-6 max-w-[1080px] mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center md:text-left">Empower Your Product Org, Risk-Free</h2>
        <p className="text-lg text-gray-700 mb-10 text-center md:text-left max-w-3xl mx-auto md:mx-0">ContextPRD is designed for CPOs who need to scale product velocity without compromising quality or security. Our pilot demonstrates this live with your data.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#fafbff] p-8 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold mb-3 text-[#0056ff]">Zero-Effort, Zero-Risk Pilot</h3>
            <p className="text-base text-gray-700">
              We manage the entire setup and data ingestion. Your team sees live, AI-drafted PRDs from your docs. <strong>You invest nothing unless it delivers clear, measurable value.</strong>
            </p>
          </div>
          <div className="bg-[#fafbff] p-8 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold mb-3 text-[#0056ff]">Boost PRD Velocity by 10x</h3>
            <p className="text-base text-gray-700">
              Eliminate weeks of research. Our AI drafts PRDs citing past decisions, metrics, and code. Free your PMs to focus on strategy, not documentation drudgery.
            </p>
          </div>
          <div className="bg-[#fafbff] p-8 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold mb-3 text-[#0056ff]">Uncompromising Security</h3>
            <p className="text-base text-gray-700">
              Your data is gold. We treat it that way with an isolated vector DB for your org, optional on-prem models, and zero training on your data by default. SOC 2 Type II in progress.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-[72px] px-6 max-w-[1080px] mx-auto bg-[#fafbff]">
        <h2 className="text-3xl font-bold mb-4 text-center">The White-Glove Pilot: Results in 1 Week</h2>
        <p className="text-lg text-gray-700 mb-10 text-center max-w-3xl mx-auto">We make it incredibly simple to experience the power of ContextPRD with your own data, at no cost or risk.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="mb-6 p-4 rounded-lg hover:bg-white transition-colors">
              <h3 className="text-xl font-bold mb-2 flex items-center"><span className="text-2xl mr-3 text-[#0056ff]">1.</span> Secure Data Share</h3>
              <p className="text-base text-gray-700 ml-7">
                You grant secure, read-only access to a Google Drive or Confluence folder (up to 500 PRDs). Our team handles all extraction, cleaning, and private indexing. <strong className="block mt-1">Minimal lift for your team.</strong>
              </p>
            </div>
            <div className="mb-6 p-4 rounded-lg hover:bg-white transition-colors">
              <h3 className="text-xl font-bold mb-2 flex items-center"><span className="text-2xl mr-3 text-[#0056ff]">2.</span> AI Co-pilot in Action</h3>
              <p className="text-base text-gray-700 ml-7">
                Within one week, we deliver a new PRD, drafted by ContextPRD using your docs, in your template. See how it contextually cites sources and accelerates drafting.
              </p>
            </div>
            <div className="p-4 rounded-lg hover:bg-white transition-colors">
              <h3 className="text-xl font-bold mb-2 flex items-center"><span className="text-2xl mr-3 text-[#0056ff]">3.</span> Value-Based Decision</h3>
              <p className="text-base text-gray-700 ml-7">
                If your PMs don't see a significant (e.g., ≥70%) reduction in PRD drafting time and an increase in quality, <strong>you owe nothing</strong>. Love it? Convert to simple per-seat SaaS pricing.
              </p>
            </div>
          </div>
          <div>
            <div className="w-full aspect-[500/420] bg-white rounded-xl flex items-center justify-center text-[#0e1a46] font-bold p-8 shadow-lg border border-gray-200">
              {/* Replace with a more relevant image/diagram */}
              <img src="https://placehold.co/400x320/e0e7ff/3730a3?text=Secure+RAG+Process" alt="Secure RAG Process Diagram" className="rounded-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-[72px] px-6 max-w-[1080px] mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Don't Just Take Our Word For It</h2>
        
        <div className="flex flex-col md:flex-row gap-6 items-start mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <img src="https://dummyimage.com/56x56/e5e7eb/4b5563.png&text=SL" alt="Sara L avatar" className="w-14 h-14 rounded-full flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-lg mb-2 italic text-gray-800">
              "ContextPRD sliced PRD drafting time from 3 hours to 20 minutes for complex features. The AI surfaced a critical dependency we'd missed twice, saving us a potential re-platform later. This isn't just faster, it's smarter."
            </p>
            <p className="text-sm text-gray-600">
              <strong>Sara L.</strong> – CPO, RocketBank
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 items-start bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <img src="https://dummyimage.com/56x56/e5e7eb/4b5563.png&text=TD" alt="Tom D avatar" className="w-14 h-14 rounded-full flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-lg mb-2 italic text-gray-800">
              "The no‑risk pilot was exactly that—zero effort for my team, instant value. We saw a PRD for a new initiative drafted with nuance that usually takes weeks to build. We signed the PO the next week. It's a CPO's dream for scaling quality."
            </p>
            <p className="text-sm text-gray-600">
              <strong>Tom D.</strong> – VP Product, ZenCommerce (Promoted to CPO Q3)
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-[72px] px-6 max-w-[1080px] mx-auto bg-[#0e1a46] text-white text-center rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to See ContextPRD Drive Real Results?</h2>
        <p className="text-lg mb-6 max-w-xl mx-auto">
          Schedule your complimentary 1-week pilot. We'll handle the setup. You see the impact. No strings attached.
        </p>
        <a 
          href="mailto:founder@contextprd.com?subject=ContextPRD%20Zero-Risk%20Pilot%20Request" 
          className="inline-block bg-[#ff7043] hover:bg-[#e06038] text-white py-4 px-10 rounded-lg font-semibold transition-colors text-lg shadow-md"
        >
          Request Your Free Pilot
        </a>
        <p className="text-sm mt-6 opacity-90">
          Limited pilot slots available each month. Response within 24 hours.
        </p>
      </section>

      {/* FAQ */}
      <section className="py-[72px] px-6 max-w-[1080px] mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions by CPOs</h2>
        
        <div className="max-w-3xl mx-auto">
          <details className="mb-4 border border-[#e2e6f6] rounded-lg p-5 bg-white shadow-sm">
            <summary className="font-bold text-lg cursor-pointer text-gray-800 hover:text-[#0056ff]">What's the actual time commitment from my team for the pilot?</summary>
            <p className="mt-3 text-base text-gray-700">
              Minimal. Primarily, it's providing read-only access to your chosen document repository (e.g., a specific Google Drive folder or Confluence space). Our team handles all data processing. Your PMs then review the AI-drafted PRD. We estimate less than 2 hours of their time for the entire pilot engagement, mostly for providing feedback.
            </p>
          </details>
          
          <details className="mb-4 border border-[#e2e6f6] rounded-lg p-5 bg-white shadow-sm">
            <summary className="font-bold text-lg cursor-pointer text-gray-800 hover:text-[#0056ff]">How do you ensure the security and privacy of our sensitive product data?</summary>
            <p className="mt-3 text-base text-gray-700">
              Security is paramount. For the pilot, your data is processed in an isolated environment. Each client (post-pilot) receives a dedicated vector database. We offer options for on-premise model hosting. We are SOC 2 Type II compliant (in progress) and do not train our foundational models on your proprietary data unless you explicitly opt-into a fine-tuning service tier.
            </p>
          </details>
          
          <details className="mb-4 border border-[#e2e6f6] rounded-lg p-5 bg-white shadow-sm">
            <summary className="font-bold text-lg cursor-pointer text-gray-800 hover:text-[#0056ff]">What are the specific KPIs you track to demonstrate value in the pilot?</summary>
            <p className="mt-3 text-base text-gray-700">
              We focus on: 1) Reduction in PRD drafting time (aiming for ≥70%). 2) Quality of the AI-generated draft (completeness, contextual relevance, citation accuracy). 3) PM feedback on usability and impact. We'll establish baseline metrics with you pre-pilot.
            </p>
          </details>
           <details className="mb-4 border border-[#e2e6f6] rounded-lg p-5 bg-white shadow-sm">
            <summary className="font-bold text-lg cursor-pointer text-gray-800 hover:text-[#0056ff]">What happens if we decide not to proceed after the pilot?</summary>
            <p className="mt-3 text-base text-gray-700">
              Absolutely nothing. The pilot is genuinely zero-risk. If you don't see the value, there's no cost or obligation. We'll securely delete all your data from our pilot systems upon request.
            </p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f1f3f9] py-8 px-6 text-sm text-center">
        © 2025 ContextPRD Inc. •&nbsp;
        <Link href="/privacy" className="text-[#0056ff] hover:underline">Privacy Policy</Link> •&nbsp;
        <Link href="/terms" className="text-[#0056ff] hover:underline">Terms of Service</Link> •&nbsp;
        <Link href="/security" className="text-[#0056ff] hover:underline">Security</Link>
      </footer>
    </div>
  );
} 