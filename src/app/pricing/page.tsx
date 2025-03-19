import Link from 'next/link';

import { Button } from '@/components/plate-ui/button';

export default function Pricing() {
  return (
    <section className="h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
        <div className="mx-auto mb-8 max-w-screen-md text-center lg:mb-12">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Designed for business teams like yours
          </h2>
        </div>
        <div className="space-y-8 sm:gap-6 lg:grid lg:grid-cols-3 lg:space-y-0 xl:gap-10">
          <div>
            <h1 className="mb-8 text-4xl font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
              FAQs
            </h1>
            <ol className="list-inside list-decimal space-y-4 ">
              <li>
                <b>
                  Am I allowed to use Leo at work? How can I get it cleared by
                  IT?
                </b>
                <ul className="mt-2 list-inside list-disc space-y-1 ps-5">
                  <li>
                    Please see our IT clearance page which contains information
                    needed for IT departments to clear DocGPT for internal use.{' '}
                  </li>
                </ul>
              </li>
              <li>
                <b>How does the money back guarantee work?</b>
                <ul className="mt-2 list-inside list-disc space-y-1 ps-5">
                  <li>
                    Email leo@docgpt.work within 14 days of signing up with a
                    cancellation reason and we will process a full refund.
                  </li>
                </ul>
              </li>
              <li>
                <b>Do you offer a free trial?</b>
                <ul className="mt-2 list-inside list-disc space-y-1 ps-5">
                  <li>
                    You are eligible for a free trial of all of Leo&#39;s
                    features for up to 7 days.
                  </li>
                </ul>
              </li>
              <li>
                <b>
                  Do I need to put in my card details to access the free trial?
                </b>
                <ul className="mt-2 list-inside list-disc space-y-1 ps-5">
                  <li>
                    No! Simply sign in with your email and you are set, no card
                    needed. At the end of the free trial, you will be prompted
                    to add in your payment details.
                  </li>
                </ul>
              </li>
              <li>
                <b>Do you offer annual plans?</b>
                <ul className="mt-2 list-inside list-disc space-y-1 ps-5">
                  <li>Not yet but we will soon!</li>
                </ul>
              </li>
            </ol>
          </div>
          <div className="mx-auto flex max-w-lg flex-col rounded-lg border border-gray-100 bg-white p-6 text-center text-gray-900 shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white xl:p-8">
            <h3 className="mb-4 text-2xl font-semibold">Starter</h3>
            <p className="font-light text-gray-500 dark:text-gray-400 sm:text-lg">
              Best option for personal use & for your next project.
            </p>
            <div className="my-8 flex items-baseline justify-center">
              <span className="mr-2 text-5xl font-extrabold">$20</span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
            </div>

            <ul className="mb-8 space-y-4 text-left" role="list">
              <li className="flex items-center space-x-3">
                <svg
                  className="size-5 shrink-0 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                <span>Side by side doc editor UI</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg
                  className="size-5 shrink-0 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                <span>Unlimited chats and docs</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg
                  className="size-5 shrink-0 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                <span>Custom context docs</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg
                  className="size-5 shrink-0 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                <span>
                  Specialized PRDs and Launch Announcements assistants
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <svg
                  className="size-5 shrink-0 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                <span>Priority Support from the founding team</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg
                  className="size-5 shrink-0 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                <span>Access to community slack channel</span>
              </li>
            </ul>
            <Button className="mt-auto">Get Started</Button>
          </div>
          <div className="mx-auto flex max-w-lg flex-col rounded-lg border border-gray-100 bg-white p-6 text-center text-gray-900 shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white xl:p-8">
            <h3 className="mb-4 text-2xl font-semibold">Enterprise</h3>
            <p className="font-light text-gray-500 dark:text-gray-400 sm:text-lg">
              Best for large scale uses and extended redistribution rights.
            </p>

            <ul className="my-8 space-y-4 text-left" role="list">
              <li className="flex items-center space-x-3">
                <svg
                  className="size-5 shrink-0 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg
                  className="size-5 shrink-0 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                <span>Direct access to founding team.</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg
                  className="size-5 shrink-0 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fillRule="evenodd"
                  ></path>
                </svg>
                <span>
                  <span className="font-semibold">
                    Feature request prioritization
                  </span>
                </span>
              </li>
            </ul>
            <Button className="mt-auto">
              <Link href="/contact">
                Get In Touch
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
