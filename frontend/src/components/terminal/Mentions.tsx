import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArticleAsNode } from "@/types/article";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

type MentionsProps = {
  article: ArticleAsNode;
  query: string;
  color?: string;
  sentences: string[];
  loading: boolean;
};

function Mentions({ article, query, sentences, loading }: MentionsProps) {
  return (
    query && (
      <Card className="relative">
        <ScrollArea className="h-[calc(76vh-80px)]">
          {!loading && (
            <>
              <CardHeader>
                <Link href={article.link ? article.link : "/"} target="_blank">
                  <SquareArrowOutUpRight
                    size={15}
                    className="absolute right-4 top-4"
                  />
                </Link>
                <CardTitle>
                  <Link
                    href={article.link ? article.link : "/"}
                    target="_blank"
                    className="max-w-64"
                  >
                    Keyword:{" "}
                    <span className="font-bold text-blue-400">
                      &ldquo;{query}&ldquo;
                    </span>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {sentences.map((sentence, index) => (
                    <li key={index} className="flex flex-row gap-2">
                      <p className="font-bold text-blue-400">{index + 1}.</p>
                      <p dangerouslySetInnerHTML={{ __html: sentence }} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </>
          )}
          {loading && <p>Loading...</p>}
        </ScrollArea>
      </Card>
    )
  );
}

export default Mentions;
