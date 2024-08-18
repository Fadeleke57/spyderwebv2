import { topics } from '@/types/topics';
import Image from 'next/image';
import Link from 'next/link';

function LandingGrid() {
  const politics = topics[0];
  const firstBlock = topics.slice(1, 5);
  const lastBlock = topics.slice(5, 9);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"> 
      <div className="col-span-2 row-span-2 relative rounded-2xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
        <Image src={politics.image} alt="logo" className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-110"/>
        <Link href={'/terminal'}>
        <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/70 group-hover:bg-transparent rounded-2xl"></div>
        <h5 className="absolute bottom-5 left-5 text-lg font-bold tracking-tight text-white dark:text-white lg:text-2xl">
          {politics.name}
        </h5>
        </Link>
      </div>

      {firstBlock.map((topic, id) => (
        <Link href={'/terminal'} key={id}>
        <div className=" row-span-2 lg:row-span-1 relative rounded-2xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
          <Image src={topic.image} alt="logo" className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-110"/>
          <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/70 group-hover:bg-transparent rounded-2xl"></div>
          <h5 className="absolute bottom-5 left-5 text-lg font-bold tracking-tight text-white dark:text-white lg:text-2xl">
            {topic.name}
          </h5>
        </div>
        </Link>
      ))}

      {lastBlock.map((topic, id) => (
        <Link href={'/terminal'} key={id}>
        <div className="relative rounded-2xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
          <Image src={topic.image} alt="logo" className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-110"/>
          <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/70 group-hover:bg-transparent rounded-2xl"></div>
          <h5 className="absolute bottom-5 left-5 text-lg font-bold tracking-tight text-white dark:text-white lg:text-2xl">
            {topic.name}
          </h5>
        </div>
        </Link>
      ))}
    </div>
  );
}

export default LandingGrid;