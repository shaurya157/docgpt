import { useRouter } from 'next/navigation';

import { SignOut } from '../landing/auth';

interface HomeHeaderProps {
    onSearch: (query: string) => void;
}

export default function HomeHeader({ onSearch }: HomeHeaderProps) {
    const router = useRouter();
    return (
        <header className="flex h-18 items-center justify-between border-b bg-white px-2 sm:px-4">
            <div className="hidden sm:block sm:w-24"></div>
            <div className="flex-grow mx-2 sm:mx-0 sm:max-w-lg">
                <input
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search documents and templates..."
                    type="text"
                />
            </div>
            <SignOut className="w-auto sm:w-24" />
        </header>
    )
}
