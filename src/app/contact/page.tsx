'use client';

import { useState } from 'react';

import { Button } from '@/components/plate-ui/button';

export default function Contact() {
  const [ subject, setSubject ] = useState("")
  const [ body, setBody ] = useState("")
  const docgptEmail = "hello@docgpt.work"

  const handleSubmit = () => {
    const formattedBody = body.replaceAll(" ", "%20").replaceAll("\n", "%0D%0A")
    window.location.href = `mailto:${docgptEmail}?subject=${subject}&body=${formattedBody}`
  }

  return (
    <section className="h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-md px-4 py-8 lg:py-16">
        <h2 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Contact Us
        </h2>
        <p className="mb-8 text-center font-light text-gray-500 dark:text-gray-400 sm:text-xl lg:mb-16">
          Reach out to us at <u><a href="mailto:hello@docgpt.work">{docgptEmail}</a></u>
        </p>
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* <div> */}
          {/*  <label */}
          {/*    className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300" */}
          {/*    htmlFor="email" */}
          {/*  > */}
          {/*    Your email */}
          {/*  </label> */}
          {/*  <input */}
          {/*    id="email" */}
          {/*    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" */}
          {/*    required */}
          {/*    placeholder="your_email@email.com" */}
          {/*    type="email" */}
          {/*  /> */}
          {/* </div> */}
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
              htmlFor="subject"
            >
              Subject
            </label>
            <input
              id="subject"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
              required
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Let us know how we can help you"
              type="text"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400"
              htmlFor="message"
            >
              Your message
            </label>
            <textarea
              id="message"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
              onChange={(e) => setBody(e.target.value)}
              placeholder="Leave a comment..."
              rows={6}
            ></textarea>
          </div>
          <div className="w-full flex flex-row-reverse">
            <Button
              variant="roundedClear"
              type="submit"
            >
              Send message
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
