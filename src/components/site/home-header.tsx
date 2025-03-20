import DocGPTIcon from '../../assets/icons/docgpt.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
interface HomeHeaderProps {
    onSearch: (query: string) => void;
}

export default function HomeHeader({ onSearch }: HomeHeaderProps) {
    const router = useRouter();
    return (
        <header className="flex h-18 items-center justify-between border-b bg-white px-4">
            <Image alt="Home" src={DocGPTIcon} className="cursor-pointer w-10 h-10" onClick={() => router.push("/home")} />
            <div className="w-1/3">
                <input
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search documents and templates..."
                    type="text"
                />
            </div>
            <div className="w-48" /> {/* Spacer for centering */}
        </header>
    )
}
