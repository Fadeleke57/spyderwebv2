export interface Article {
  id: string;
  header: string;
  author: string;
  date_published: string;
  link: string;
  text: string;
  sentiment: number;
  subjectivity: number;
  reliability_score: number;
}

export interface ArticleAsNode {
  id: string;
  header: string;
  author: string;
  date_published: string;
  link: string;
  text: string;
  sentiment: number;
  subjectivity: number;
  reliability_score: number;
  x: number;
  y: number;
}

export interface ConfigFormValues {
  query: string;
  topic: string;
  enableSpydrSearch: boolean;
}

export type demoArticleType = {
  title: string;
  topics: {
    name: string;
    color: string;
  }[];
  sentiment: number;
  subjectivity: number;
};

export const demoArticles: demoArticleType[] = [
  {
    title: `What Google${`'`}s Antitrust Defeat Means for AI`,
    topics: [
      {
        name: "Ideas",
        color: "violet",
      },
      {
        name: "Tech",
        color: "red",
      },
    ],
    sentiment: 0.008254689754689758,
    subjectivity: 0.3885269841269841,
  },
  {
    title: "The IOC Wants the Olympics to Be Apolitical.",
    topics: [
      {
        name: "World",
        color: "red",
      },
      {
        name: "Olympics 2024",
        color: "amber",
      },
    ],
    sentiment: 0.07886243386243388,
    subjectivity: 0.29578042328042337,
  },
  {
    title: "Will J.D. Vance and Tim Walz Actually Face Off?",
    topics: [
      {
        name: "Politics",
        color: "red",
      },
      {
        name: "2024 Elections",
        color: "amber",
      },
    ],
    sentiment: -0.07413281163281162,
    subjectivity: 0.4847828097828098,
  },
  {
    title: `Thailand${`'`}s New Prime Minister Is Getting Down to Business.`,
    topics: [
      {
        name: "World",
        color: "green",
      },
      {
        name: "Thailand",
        color: "purple",
      },
    ],
    sentiment: 0.0885113035113035,
    subjectivity: 0.3616364438031106,
  },
  {
    title: "The Billion-Dollar Price Tag of Building AI",
    topics: [
      {
        name: "Tech",
        color: "red",
      },
      {
        name: "Artificial Intelligence",
        color: "blue",
      },
    ],
    sentiment: -0.1254526915985249,
    subjectivity: 0.5040672097963764,
  },
];
