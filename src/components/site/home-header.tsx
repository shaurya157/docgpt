interface HomeHeaderProps {
    onSearch: (query: string) => void;
}

export default function HomeHeader({ onSearch }: HomeHeaderProps) {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4">
            <div className="w-48">
                <h1 className="text-xl font-semibold">Home</h1>
            </div>
            <div className="w-1/3">
                <input
                    type="text"
                    placeholder="Search documents and templates..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
            <div className="w-48" /> {/* Spacer for centering */}
        </header>
    )
}
