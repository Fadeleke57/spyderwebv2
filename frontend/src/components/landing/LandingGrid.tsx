import { useMemo } from "react";
import { topicsWithSubtopics } from "@/types/topics";
import Image from "next/image";
import Link from "next/link";
import { Topic } from "@/types/topics";
import { Skeleton } from "../ui/skeleton";

function shuffleArray(array: Topic[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function LandingGrid() {
  const shuffledTopics = useMemo(
    () => shuffleArray([...topicsWithSubtopics]),
    []
  );
  const firstItem: Topic = shuffledTopics[0];
  const firstBlock: Topic[] = shuffledTopics.slice(1, 5);
  const lastBlock: Topic[] = shuffledTopics.slice(5, 9);

  if (!shuffledTopics.length) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-60" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* First Large Item */}
      <div className="hidden lg:block w-full h-full col-span-2 row-span-2 relative rounded-2xl border border-gray-200 dark:border-none shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
        <Image
          src={firstItem.image}
          alt="logo"
          className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-110"
        />
        <Link
          href={{
            pathname: "/explore",
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
          }}
          key={id}
        >
          <div className="w-full h-full row-span-2 lg:row-span-1 relative rounded-2xl border border-gray-200 dark:border-none shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
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

      <div className="lg:hidden w-full h-full row-span-2 relative rounded-2xl border border-gray-200 dark:border-none shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
        <Image
          src={firstItem.image}
          alt="logo"
          className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-110"
        />
        <Link
          href={{
            pathname: "/explore",
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
          }}
          key={id}
        >
          <div className="w-full h-full relative rounded-2xl border border-gray-200 dark:border-none shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer overflow-hidden group">
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
