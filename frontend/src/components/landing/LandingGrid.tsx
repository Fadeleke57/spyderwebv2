import { useEffect, useState } from "react";
import { topicsWithSubtopics } from "@/types/topics";
import Image from "next/image";
import Link from "next/link";
import { Topic } from "@/types/topics";
import { LandingLoader } from "../utility/Loading";
import { Skeleton } from "../ui/skeleton";

function shuffleArray(array: Topic[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function LandingGrid() {
  const [shuffledTopics, setShuffledTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean | null>(null);

  useEffect(() => {
    const shuffled : Topic[] = shuffleArray([...topicsWithSubtopics]);
    setShuffledTopics(shuffled);
    setLoading(false);
  }, []);

  const firstItem : Topic = shuffledTopics[0];
  const firstBlock : Topic[] = shuffledTopics.slice(1, 5);
  const lastBlock : Topic[] = shuffledTopics.slice(5, 9);

  return loading || !shuffledTopics.length ? (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton className="w-300 h-60" />
      <Skeleton className="w-100 h-60" />
      <Skeleton className="w-100 h-60" />
      <Skeleton className="w-100 h-60" />
      <Skeleton className="w-100 h-60" />
      <Skeleton className="w-100 h-60" />
      <Skeleton className="w-100 h-60" />
      <Skeleton className="w-100 h-60" />
      <Skeleton className="w-100 h-60" />
    </div>
  ) : (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="hidden lg:block w-full h-full col-span-2 row-span-2 relative rounded-2xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
        <Image
          src={firstItem.image}
          alt="logo"
          className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-110"
        />
        <Link
          href={{
            pathname: "/explore",
            query: { topic: firstItem.name.toLowerCase() },
          }}
        >
          <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/70 group-hover:bg-transparent rounded-2xl"></div>
          <h5 className="absolute bottom-5 left-5 text-lg font-bold tracking-tight text-white dark:text-white lg:text-2xl">
            {firstItem.name}
          </h5>
        </Link>
      </div>

      {firstBlock.map((topic, id) => (
        <Link
          href={{
            pathname: "/explore",
            query: { topic: topic.name.toLowerCase() },
          }}
          key={id}
        >
          <div className="w-full h-full row-span-2 lg:row-span-1 relative rounded-2xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
            <Image
              src={topic.image}
              alt="logo"
              className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-110"
            />
            <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/70 group-hover:bg-transparent rounded-2xl"></div>
            <h5 className="absolute bottom-5 left-5 text-lg font-bold tracking-tight text-white dark:text-white lg:text-2xl">
              {topic.name}
            </h5>
          </div>
        </Link>
      ))}

      <div className="lg:hidden w-full h-full row-span-2 relative rounded-2xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
        <Image
          src={firstItem.image}
          alt="logo"
          className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-110"
        />
        <Link
          href={{
            pathname: "/explore",
            query: { topic: firstItem.name.toLowerCase() },
          }}
        >
          <div className="w-full h-full absolute top-0 left-0 bg-neutral-950/70 group-hover:bg-transparent rounded-2xl"></div>
          <h5 className="absolute bottom-5 left-5 text-lg font-bold tracking-tight text-white dark:text-white lg:text-2xl">
            {firstItem.name}
          </h5>
        </Link>
      </div>

      {lastBlock.map((topic, id) => (
        <Link
          href={{
            pathname: "/explore",
            query: { topic: topic.name.toLowerCase() },
          }}
          key={id}
        >
          <div className="w-full h-full relative rounded-2xl border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
            <Image
              src={topic.image}
              alt="logo"
              className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-110"
            />
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
