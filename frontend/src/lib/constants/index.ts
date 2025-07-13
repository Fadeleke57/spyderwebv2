import { environment } from "@/environment/loadenv";
import { WebTag } from "@/types/web";

export const SHOWCASE_IMAGE =
  "https://www.spydr.dev/_next/image?url=https%3A%2F%2Fd1jh2f1w3pfli.cloudfront.net%2Ffiles%2F8f05ff19-ab84-47ba-bd02-bed09c405981%2Fb2a3ccf8-cd84-44d3-8b28-bfb17aa94631%2Fimages%2FChatGPT_Image_Apr_6_2025_09_59_35_PM.png&w=1080&q=75";

export const colorOptions = [
  "#5ea4ff",
  "#ff6f61",
  "#6b5b95",
  "#88b04b",
  "#f7cac9",
];

export const ACCEPTED_FILE_TYPES_MAP = {
  pdf: [".pdf"],
  markdown: [".md"],
  txt: [".txt"],
  docs: [".doc", ".docx", ".hwp", ".hwpx"],
  powerpoint: [".ppt", ".pptx"],
  excel: [".xls", ".xlsx"],
};

export const ACCEPTED_FILE_TYPES = Object.values(
  ACCEPTED_FILE_TYPES_MAP
).flat();

export const tagsList: WebTag[] = [
  {
    value: "Preferences",
    label: "preferences",
  },
  {
    value: "AI",
    label: "ai",
  },
  {
    value: "Technology",
    label: "technology",
  },
  {
    value: "Science",
    label: "science",
  },
  {
    value: "Politics",
    label: "politics",
  },
  {
    value: "Business",
    label: "business",
  },
  {
    value: "Research",
    label: "research",
  },
  {
    value: "Documentation",
    label: "documentation",
  },
  {
    value: "Entertainment",
    label: "entertainment",
  },
  {
    value: "Other",
    label: "other",
  },
];

export type FeedMapType = {
  [key: string]: {
    name: "Claude" | "ChatGPT" | "Cascade - Windsurf" | "Cursor" | "Highlight AI" | "Continue" | "Cline" | "Tiktok" | "X" | "Notion" | "Blackboard";
    link: string;
    syncLink: string | null;
    image: string;
    description: string;
    category: string;
    zoom: boolean;
    disabled?: boolean;
  }[];
};

export const feedMap: FeedMapType = {
  AI: [
    {
      name: "Claude",
      link: "https://claude.ai/login?returnTo=%2F%3F#features",
      syncLink: `${environment.client_url}/memory`,
      image:
        "https://pub-4271c874f759418fbdcd18b0e5cbe024.r2.dev/Claude/claude-logo.png",
      description:
        "Anthropic LLM for drafting, analyzing, and safe enterprise AI work.",
      category: "AI",
      zoom: false,
    },
    {
      name: "ChatGPT",
      link: "https://chat.openai.com/",
      syncLink: `${environment.client_url}/memory`,
      image:
        "https://static.vecteezy.com/system/resources/previews/021/608/790/non_2x/chatgpt-logo-chat-gpt-icon-on-black-background-free-vector.jpg",
      description:
        "OpenAI LLM for questions, ideas, and coding help. Used across coding agents.",
      category: "AI",
      zoom: false,
    },
    {
      name: "Cascade - Windsurf",
      link: "https://windsurf.com/",
      syncLink: `${environment.client_url}/memory`,
      image:
        "https://exafunction.github.io//public/brand/windsurf-black-symbol.png",
      description:
        "(Formerly Codeium) AI coding agent and IDE for quick code generation and refactoring.",
      category: "AI",
      zoom: false,
    },
    {
      name: "Cursor",
      link: "https://cursor.sh/",
      syncLink: `${environment.client_url}/memory`,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrQ_CU3a6muH84mLfoP6xmM4ZJ9Z6RAXMmdA&s",
      description:
        "AI-powered editor for querying repos and rewriting code via chat.",
      category: "AI",
      zoom: false,
    },
    {
      name: "Highlight AI",
      link: "https://highlight.ai/",
      syncLink: `${environment.client_url}/memory`,
      image:
        "https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/c574b1be9f924cd3a758e49965eda041",
      description:
        "Desktop AI assistant that brings LLM capabilities directly to your workflow",
      category: "AI",
      zoom: false,
    },
    {
      name: "Continue",
      link: "https://continue.dev/",
      syncLink: `${environment.client_url}/memory`,
      image: "https://hub.continue.dev/continue-logo.png",
      description:
        "Open-source IDE extension adding chat, autocomplete, and custom LLM agents.",
      category: "AI",
      zoom: true,
    },
    {
      name: "Cline",
      link: "https://cline.bot/",
      syncLink: `${environment.client_url}/memory`,
      image:
        "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/cline.png",
      description:
        "Autonomous VS Code bot that plans, executes, and commits features.",
      category: "AI",
      zoom: true,
    },
  ],
  Social: [
    {
      name: "Tiktok",
      link: "https://www.tiktok.com/",
      syncLink: null,
      image:
        "https://www.pagetraffic.com/blog/wp-content/uploads/2022/06/new-latest-tiktok-logo-png.png",
      description:
        "Short-form video platform with highly personalized, algorithmic content feed.",
      category: "Social",
      zoom: false,
      disabled: true,
    },
    {
      name: "X",
      link: "https://x.com/",
      syncLink: null,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/X_logo.jpg/1200px-X_logo.jpg",
      description:
        'Rebranded Twitter for real-time posts and Musk\'s "everything-app" vision.',
      category: "Social",
      zoom: false,
      disabled: true,
    },
  ],
  Productivity: [
    {
      name: "Notion",
      link: "https://notion.com/",
      syncLink: null,
      image: "https://cdn.creazilla.com/icons/3270344/notion-icon-sm.png",
      description:
        "Collaborative workspace for notes, wikis, and project management.",
      category: "Productivity",
      zoom: true,
      disabled: true,
    },
  ],
  Education: [
    {
      name: "Blackboard",
      link: "https://www.anthology.com/products/teaching-and-learning/learning-effectiveness/blackboard",
      syncLink: null,
      image:
        "https://yt3.googleusercontent.com/RnspR8_27Gm0WwXtxNuSJ0vmFg-rjelZIaY9xTNlyBNf10qQ8akrIZaZ353hhkqSZXlgL7MZZQ=s900-c-k-c0x00ffffff-no-rj",
      description:
        "Online learning platform for education and training used across schools.",
      category: "Education",
      zoom: false,
      disabled: true,
    },
  ],
};

export const getAllFeeds = () => {
  return Object.values(feedMap).flat();
};

export const getFeedsByCategory = (category: string) => {
  return feedMap[category] || [];
};

export const getFeedByName = (name: string) => {
  for (const category of Object.values(feedMap)) {
    const feed = category.find((f) => f.name === name);
    if (feed) return feed;
  }
  return null;
};
