'use client';

import { Button } from '@/components/plate-ui/button';

export default function Leo() {
  return (
    <div className="flex flex-col items-center">
      <section className="mt-20 flex h-1/3 w-full flex-col items-center justify-center">
        <h1 className="mb-8 text-4xl font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          Become a 10x Product Manager with Leo
        </h1>
        <p className="mb-6 text-center text-lg font-normal  dark:text-gray-400 sm:px-16 lg:text-xl xl:px-48">
          Leo is a virtual Product Manager that can write and critique your
          PRDs, suggest and evaluate new feature ideas, draft launch
          announcements, and more.
        </p>
        <p className="mb-6 text-center text-lg font-normal dark:text-gray-400 sm:px-16 lg:text-xl xl:px-48">
          Leo is a customized LLM that you interact with through purpose-built
          UI, designed to make you the best PM you can be.
        </p>
        <Button className="px-10">Get Leo</Button>
      </section>
      <section className="mt-10 h-1/3">
        <video
          autoPlay
          loop
          muted
          className="size-full rounded-lg"
          src="https://media1.giphy.com/media/2rqEdFfkMzXmo/giphy.mp4?cid=790b76118e85130b6027e42ff5aca28cf62871c4e09f8306&rid=giphy.mp4&ct=g"
        >
          A man moving his hands away from his forehead sideways, in a
          mind-explosion gesture. An overlaid animation enforces the explosion
          character.
        </video>
      </section>
      <section className="mt-10 flex h-1/3 w-full flex-col items-center justify-center">
        <h1 className="mb-8 text-4xl font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          PRDs written in minutes
        </h1>
        <p className="mb-6 text-center text-lg font-normal  dark:text-gray-400 sm:px-16 lg:text-xl xl:px-48">
          Just select a PRD template and tell Leo what you want to write a PRD
          about. Leo will ask you any clarifying questions he has about the idea
          and within seconds, will prepare a PRD for you. Leo will also point
          out areas where he needs more clarity or data to improve the PRD.
        </p>
        <Button className="px-10">Watch the video</Button>
      </section>
      <section className="mt-10 h-1/3">
        <video
          autoPlay
          loop
          muted
          className="size-full rounded-lg"
          src="https://media1.giphy.com/media/2rqEdFfkMzXmo/giphy.mp4?cid=790b76118e85130b6027e42ff5aca28cf62871c4e09f8306&rid=giphy.mp4&ct=g"
        >
          A man moving his hands away from his forehead sideways, in a
          mind-explosion gesture. An overlaid animation enforces the explosion
          character.
        </video>
      </section>
      <section className="mt-10 flex h-1/3 w-full flex-col items-center justify-center">
        <h1 className="mb-8 text-4xl font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          Brainstorming feature ideas
        </h1>
        <p className="mb-6 text-center text-lg font-normal  dark:text-gray-400 sm:px-16 lg:text-xl xl:px-48">
          Leo is trained to review your current roadmap and suggest new ideas
          for you to consider prioritizing. Just provide context docs and ask!
        </p>
        <Button className="px-10">Watch the video</Button>
      </section>
      <section className="my-10 h-1/3">
        <video
          autoPlay
          loop
          muted
          className="size-full rounded-lg"
          src="https://media1.giphy.com/media/2rqEdFfkMzXmo/giphy.mp4?cid=790b76118e85130b6027e42ff5aca28cf62871c4e09f8306&rid=giphy.mp4&ct=g"
        >
          A man moving his hands away from his forehead sideways, in a
          mind-explosion gesture. An overlaid animation enforces the explosion
          character.
        </video>
      </section>
    </div>
  );
}
