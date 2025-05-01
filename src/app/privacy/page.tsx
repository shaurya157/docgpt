import React from 'react';

import PreLoginFooter from '@/components/landing/pre-login-footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">PRIVACY POLICY</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: April 28, 2025</p>

          <p className="mb-6 text-gray-700 leading-relaxed">This Privacy Notice for DocGPT (“we,” “us,” or “our”), describes how and why we might access, collect, store, use, and/or share (“process”) your personal information when you use our services (“Services”), including when you:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
            <li>Visit our website at <a className="text-blue-600 hover:text-blue-800 hover:underline" href="https://www.docgpt.work/">https://www.docgpt.work/</a>, or any website of ours that links to this Privacy Notice</li>
            <li>Use DocGPT, an AI-powered document editing tool</li>
            <li>Engage with us in other related ways, including any sales, marketing, or events</li>
          </ul>

          <p className="mb-6 text-gray-700 leading-relaxed">Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a className="text-blue-600 hover:text-blue-800 hover:underline" href="mailto:hello@docgpt.work">hello@docgpt.work</a>.</p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-800">SUMMARY OF KEY POINTS</h2>
          <p className="mb-6 text-gray-700 leading-relaxed">This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for.</p>

          <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
            <li><strong className="font-semibold text-gray-800">What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about <a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-1">personal information you disclose to us</a>.</li>
            <li><strong className="font-semibold text-gray-800">Do we process any sensitive personal information?</strong> Some of the information may be considered “special” or “sensitive” in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.</li>
            <li><strong className="font-semibold text-gray-800">Do we collect any information from third parties?</strong> We do not collect any information from third parties.</li>
            <li><strong className="font-semibold text-gray-800">How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. Learn more about <a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-2">how we process your information</a>.</li>
            <li><strong className="font-semibold text-gray-800">In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Learn more about <a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-4">when and with whom we share your personal information</a>.</li>
            <li><strong className="font-semibold text-gray-800">How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about <a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-9">how we keep your information safe</a>.</li>
            <li><strong className="font-semibold text-gray-800">What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about <a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-11">your privacy rights</a>.</li>
            <li><strong className="font-semibold text-gray-800">How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a data subject access request, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-800">TABLE OF CONTENTS</h2>
          <ol className="list-decimal pl-6 mb-8 space-y-2 text-gray-700">
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-1">WHAT INFORMATION DO WE COLLECT?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-2">HOW DO WE PROCESS YOUR INFORMATION?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-3">WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-4">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-5">DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-6">DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-7">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-8">HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-9">HOW DO WE KEEP YOUR INFORMATION SAFE?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-10">DO WE COLLECT INFORMATION FROM MINORS?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-11">WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-12">CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-13">DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-14">DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-15">DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-16">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
            <li><a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-17">HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></li>
          </ol>

          <h2 id="section-1" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">1. WHAT INFORMATION DO WE COLLECT?</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700">Personal information you disclose to us</h3>
          <p className="mb-4 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> We collect personal information that you provide to us.</p>
          <p className="mb-4 text-gray-700 leading-relaxed">We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
          <p className="mb-4 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">Personal Information Provided by You.</strong> Depends on context and choices, and may include: email addresses, usernames, passwords, contact preferences, names, phone numbers, job titles, debit/credit card numbers, billing addresses</p>
          <p className="mb-4 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">Sensitive Information.</strong> We do not process sensitive information.</p>
          <p className="mb-4 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">Social Media Login Data.</strong> If you register via social media (e.g., Facebook, X), we collect certain profile information as described under <a className="text-blue-600 hover:text-blue-800 hover:underline" href="#section-7">“HOW DO WE HANDLE YOUR SOCIAL LOGINS?”</a></p>
          <p className="mb-6 text-gray-700 leading-relaxed">All personal information you provide must be true, complete, and accurate, and you must notify us of any changes.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700">Information automatically collected</h3>
          <p className="mb-4 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> Some information—such as your IP address and/or browser and device characteristics—is collected automatically when you visit our Services.</p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li><strong className="font-semibold text-gray-800">Log and Usage Data.</strong> Diagnostic, usage, and performance info recorded in log files (IP address, device info, browser type, settings, timestamps, pages viewed, searches, features used, crash dumps).</li>
              <li><strong className="font-semibold text-gray-800">Device Data.</strong> Info about your computer, phone, tablet, etc., including IP address, device/app identification numbers, location, browser type, hardware model, ISP/mobile carrier, OS, and system config.</li>
              <li><strong className="font-semibold text-gray-800">Location Data.</strong> Geolocation info (precise or imprecise) based on IP or device GPS. You can opt out via device settings, though this may limit Service features.</li>
              <li><strong className="font-semibold text-gray-800">Cookies & Similar Tech.</strong> We, and third parties for analytics and advertising, use cookies, web beacons, pixels.</li>
          </ul>
          <p className="mb-8 text-gray-700 leading-relaxed">Our use of Google APIs adheres to Google’s API Services User Data Policy.</p>


          <h2 id="section-2" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
          <p className="mb-4 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</p>
          <p className="mb-4 text-gray-700 leading-relaxed">We process personal information for a variety of reasons, including:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
            <li><strong className="font-semibold text-gray-800">Account Management.</strong> Facilitate creation, authentication, and maintenance of user accounts.</li>
            <li><strong className="font-semibold text-gray-800">Feedback Requests.</strong> Contact you about your use of our Services.</li>
            <li><strong className="font-semibold text-gray-800">Security & Fraud Prevention.</strong> Keep our Services safe and secure.</li>
            <li><strong className="font-semibold text-gray-800">Usage Trends.</strong> Analyze how our Services are used to improve them.</li>
            <li><strong className="font-semibold text-gray-800">Vital Interests.</strong> Protect individuals' safety or vital interests.</li>
          </ul>

          <h2 id="section-3" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</h2>
          <p className="mb-4 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> We only process your personal information when we have a valid legal reason under applicable law.</p>
          <p className="mb-4 text-gray-700 leading-relaxed">If you are in the EU/UK, we may rely on:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
            <li><strong className="font-semibold text-gray-800">Consent.</strong> You've given permission for specific purposes; you may withdraw at any time.</li>
            <li><strong className="font-semibold text-gray-800">Legitimate Interests.</strong> Necessary for our business interests (e.g., improving Services, fraud prevention) provided they don't override your rights.</li>
            <li><strong className="font-semibold text-gray-800">Legal Obligations.</strong> Compliance with laws, litigation, requests by law enforcement.</li>
            <li><strong className="font-semibold text-gray-800">Vital Interests.</strong> Protect life or safety.</li>
          </ul>
          <p className="mb-8 text-gray-700 leading-relaxed">If you are in Canada, we rely on express or implied consent, or in exceptional cases where permitted by law (e.g., insurance claims, investigations).</p>

          <h2 id="section-4" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
          <p className="mb-4 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> We may share information in specific situations with certain third parties.</p>
          <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
            <li><strong className="font-semibold text-gray-800">Business Transfers.</strong> In connection with mergers, acquisitions, financing, sale of assets, etc.</li>
          </ul>

          <h2 id="section-5" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
          <p className="mb-4 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> Yes—we and our service providers use cookies, web beacons, pixels for functionality, analytics, security, and advertising purposes.</p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
            <li>You can refuse or delete cookies via browser settings, but this may affect Service features.</li>
            <li>For details, see our Cookie Notice.</li>
            <li>We share information with Google Analytics for usage tracking. You can opt out via Google's opt-out tools.</li>
          </ul>

          <h2 id="section-6" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
          <p className="mb-8 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> Yes, we offer AI-powered products and tools via third-party providers (OpenAI, Anthropic, Google Cloud AI). Your inputs and outputs may be shared with these providers per this Privacy Notice and their policies.</p>

          <h2 id="section-7" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
          <p className="mb-8 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> If you log in via social media, we receive certain profile information (name, email, friends list, profile picture) which we use only as described in this Privacy Notice.</p>

          <h2 id="section-8" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">8. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
          <p className="mb-8 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> We retain personal information only as long as necessary for the purposes in this Privacy Notice or as required by law. Generally, no longer than 12 months past account termination, unless legally required.</p>

          <h2 id="section-9" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">9. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
          <p className="mb-8 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> We employ reasonable technical and organizational measures to protect your personal information, but cannot guarantee 100% security of electronic transmissions or storage.</p>

          <h2 id="section-10" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">10. DO WE COLLECT INFORMATION FROM MINORS?</h2>
          <p className="mb-8 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> We do not knowingly collect data from or market to children under 18. If we learn we have, we will deactivate the account and delete the data promptly.</p>

          <h2 id="section-11" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">11. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
          <p className="mb-8 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal information, and to withdraw consent. You may also unsubscribe from marketing communications. Contact us at <a className="text-blue-600 hover:text-blue-800 hover:underline" href="mailto:hello@docgpt.work">hello@docgpt.work</a> to exercise these rights.</p>

          <h2 id="section-12" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">12. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
          <p className="mb-8 text-gray-700 leading-relaxed">Most browsers/mobile OS offer Do-Not-Track (“DNT”) settings, but no uniform standard exists. We currently do not respond to DNT signals.</p>

          <h2 id="section-13" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">13. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
          <p className="mb-8 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> Yes—residents of many US states (e.g., California, Colorado, Connecticut, Delaware, Florida, etc.) have rights to access, correct, delete their personal information, and to opt out of sale/sharing for targeted advertising. See the full section for details on categories collected, disclosures, and how to exercise those rights.</p>

          <h2 id="section-14" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">14. DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
            <li><strong className="font-semibold text-gray-800">Australia & New Zealand.</strong> Rights under Privacy Act 1988 (AU) and Privacy Act 2020 (NZ).</li>
            <li><strong className="font-semibold text-gray-800">South Africa.</strong> Rights under POPIA/PAIA; contact the Information Regulator.</li>
          </ul>

          <h2 id="section-15" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">15. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
          <p className="mb-8 text-gray-700 leading-relaxed"><strong className="font-semibold text-gray-800">In Short:</strong> Yes—we will update this Privacy Notice as necessary. We indicate changes by updating the “Revised” date and may notify you directly if material changes occur.</p>

          <h2 id="section-16" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">16. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
          <p className="mb-4 text-gray-700 leading-relaxed">If you have questions or comments, email <a className="text-blue-600 hover:text-blue-800 hover:underline" href="mailto:hello@docgpt.work">hello@docgpt.work</a> or write to:</p>
          <address className="not-italic mb-8 text-gray-700 leading-relaxed">
            DocGPT,<br />
            1301 5th Ave,<br />
            Seattle, 98101
          </address>

          <h2 id="section-17" className="text-2xl font-semibold mt-10 mb-4 text-gray-800">17. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
          <p className="mb-8 text-gray-700 leading-relaxed">Depending on applicable laws, you may request access to, correction of, or deletion of your personal information, or withdraw consent by submitting a data subject access request or contacting us at <a className="text-blue-600 hover:text-blue-800 hover:underline" href="mailto:hello@docgpt.work">hello@docgpt.work</a>.</p>

        </div>
      </main>
      <PreLoginFooter />
    </div>
  );
}
