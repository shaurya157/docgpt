import { HomeIcon, SquarePen } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DocumentHeader = () => {
  const router = useRouter();

  return (
    <header className="flex h-16 items-center border-b bg-white px-4">
      <div className="flex items-center ">
        <button className="rounded-lg p-2 hover:bg-[#ECECEC] cursor-pointer" onClick={() => { router.push("/home") }}>
          <HomeIcon/>
        </button>
      </div>
    </header>
  );
};

export default DocumentHeader;
