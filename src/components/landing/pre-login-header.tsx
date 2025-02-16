import Link from 'next/link';

import SignInButton from "@/components/landing/sign-in-button";

export default function PreLoginHeader() {
  return (
    <div className="flex w-full flex-row items-stretch justify-end border-b-2 border-gray-500 border-opacity-25 p-4 align-bottom">
      <Link className="flex items-center" href="/leo">
        <b className="mr-14">
          <u>Leo&#39;s capabilities</u>
        </b>
      </Link>

      <Link className="flex items-center" href="/pricing">
        <b className="mr-14">Pricing</b>
      </Link>

      <Link className="flex items-center" href="/contact">
        <b className="mr-14">Contact</b>
      </Link>
      <SignInButton />
    </div>
  );
}
