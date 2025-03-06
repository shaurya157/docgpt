'use client';

import {VideoIcon} from "lucide-react";
import { useSession } from 'next-auth/react';
import Image from "next/image";
import Link from 'next/link';
import { redirect } from 'next/navigation';

import {Button} from "@/components/plate-ui/button";

import Chatbox from '../assets/images/chatbox.png';
import ContextDocs from '../assets/images/contextdocs.png';
import QuickEdit from '../assets/images/quickedit.png';
import Site from '../assets/images/site.png';
import Templates from '../assets/images/templates.png';

export default function Landing() {
  const { data: session } = useSession();

  if (session?.user) {
    return redirect('/home');
  }

  return <div className="flex flex-col items-center">
    <div className="flex flex-col items-center container">
      <section className="my-20 p-10 flex h-1/3 w-full flex-row-reverse items-center">
        <div className="w-1/2 flex flex-col px-10 h-full">
          <h1 className="mb-8 text-5xl font-bold leading-none tracking-tight text-gray-900 dark:text-white ">
            Create product artifact documents in minutes
          </h1>
          <p className="mb-6 text-lg font-normal  dark:text-gray-400">
            Create PRDs using our tailored LLMs and purpose built chat and document editing interface.
          </p>
          <div className="flex justify-center">
            <Button className="mr-2">
              <Link href="/pricing">
                Try it for free
              </Link>

            </Button>
            <Button variant="roundedClear" className="px-10">
              <VideoIcon />
              DocGPT in 60 seconds
            </Button>
          </div>
        </div>
        <div className="w-1/2 flex justify-center">
          <Image alt="Chatbox image showing various hotlink options for faster chat" src={Chatbox}/>
        </div>
      </section>
      <section className="my-20 p-10 flex h-1/3 w-full flex-row items-center">
        <div className="w-1/2 flex flex-col px-10 h-full">
          <h1 className="mb-8 text-5xl font-bold leading-none tracking-tight text-gray-900 dark:text-white">
            Hyper relevant responses
          </h1>
          <p className="mb-6 text-lg font-normal  dark:text-gray-400">
            DocGPT will use customized, task tuned LLM models and look through context documents you have provided to provide responses that are hyper relevant to your product area.
          </p>
          <p className="mb-6 text-lg font-normal  dark:text-gray-400">
            DocGPT will ask clarifying questions to make sure it has the necessary information to avoid vague responses.
          </p>
        </div>
        <div className="w-1/2 flex justify-center">
          <Image alt="ContextDocs image showing file upload functionality for RAG - Retrieval Augmented Generation to help users automatically query all their files to generate new documents" src={ContextDocs}/>
        </div>
      </section>
      <section className="my-20 p-10 flex h-1/3 w-full flex-row-reverse items-center">
        <div className="w-1/2 flex flex-col px-10 h-full">
          <h1 className="mb-8 text-5xl font-bold leading-none tracking-tight text-gray-900 dark:text-white">
            Next generation document editing
          </h1>
          <p className="mb-6 text-lg font-normal  dark:text-gray-400">
            DocGPT’s document editing interface incorporates a side-by-side chat interface, allowing you to rapidly provide document editing instructions.
          </p>
        </div>
        <div className="w-1/2 flex justify-center">
          <Image alt="ContextDocs image showing file upload functionality for RAG - Retrieval Augmented Generation to help users automatically query all their files to generate new documents" src={Site}/>
        </div>
      </section>
      <section className="my-20 p-10 flex h-1/3 w-full flex-row items-center">
        <div className="w-1/2 flex flex-col px-10 h-full">
          <h1 className="mb-8 text-5xl font-bold leading-none tracking-tight text-gray-900 dark:text-white">
            Add a custom template for your company’s document format
          </h1>
          <p className="mb-6 text-lg font-normal  dark:text-gray-400">
            Create a custom template and select it when creating a PRD or other document. We will default to using this custom template when creating future documents of the same type.
          </p>
        </div>
        <div className="w-1/2 flex justify-center">
          <Image alt="Templates for templatized AI enhanced document creation" src={Templates}/>
        </div>
      </section>
      <section className="my-20 p-10 flex h-1/3 w-full flex-row-reverse items-center">
        <div className="w-1/2 flex flex-col px-10 h-full">
          <h1 className="mb-8 text-5xl font-bold leading-none tracking-tight text-gray-900 dark:text-white">
            Add a custom template for your company’s document format
          </h1>
          <p className="mb-6 text-lg font-normal  dark:text-gray-400">
            Create a custom template and select it when creating a PRD or other document. We will default to using this custom template when creating future documents of the same type.
          </p>
        </div>
        <div className="w-1/2 flex justify-center">
          <Image alt="Quick Edit functionality for editing using AI on the fly" src={QuickEdit}/>
        </div>
      </section>
      {/* <section className="my-20 p-10 flex h-1/3 w-full items-center justify-center"> */}
      {/*  <div className="w-1/2 flex flex-col px-10 h-full"> */}
      {/*    <h1 className="mb-8 text-xl font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl"> */}
      {/*      Supercharge your team’s shipping speed for $20/month */}
      {/*    </h1> */}
      {/*    <p className="mb-6 text-lg font-normal  dark:text-gray-400"> */}
      {/*      DocGPT is built to minimize the time that tech teams spend either not talking to customers or writing code. Doc GPT can.. */}
      {/*    </p> */}
      {/*  </div> */}
      {/* </section> */}

    </div>
  </div>;
}