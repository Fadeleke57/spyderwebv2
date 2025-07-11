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

export const feedMap = {
  Claude: {
    name: "Claude",
    link: "https://claude.ai/login?returnTo=%2F%3F#features",
    image:
      "https://pub-4271c874f759418fbdcd18b0e5cbe024.r2.dev/Claude/claude-logo.png",
    description:
      "Anthropic LLM for drafting, analyzing, and safe enterprise AI work.",
    category: "AI",
    zoom: false,
  },
  ChatGPT: {
    name: "ChatGPT",
    link: "https://chat.openai.com/",
    image:
      "https://static.vecteezy.com/system/resources/previews/021/608/790/non_2x/chatgpt-logo-chat-gpt-icon-on-black-background-free-vector.jpg",
    description:
      "OpenAI GPT-4 chat assistant for questions, ideas, and coding help.",
    category: "AI",
    zoom: false,
  },
  Windsurf: {
    name: "Cascade - Windsurf",
    link: "https://windsurf.com/",
    image:
      "https://exafunction.github.io//public/brand/windsurf-black-symbol.png",
    description:
      "AI coding agent that understands codebases and automates complex refactors.",
    category: "AI",
    zoom: false,
  },
  Cursor: {
    name: "Cursor",
    link: "https://cursor.sh/",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrQ_CU3a6muH84mLfoP6xmM4ZJ9Z6RAXMmdA&s",
    description:
      "AI-powered editor for querying repos and rewriting code via chat.",
    zoom: false,
  },
  Continue: {
    name: "Continue",
    link: "https://continue.dev/",
    image: "https://hub.continue.dev/continue-logo.png",
    description:
      "Open-source IDE extension adding chat, autocomplete, and custom LLM agents.",
    category: "AI",
    zoom: true,
  },
  Cline: {
    name: "Cline",
    link: "https://cline.bot/",
    image:
      "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/cline.png",
    description:
      "Autonomous VS Code bot that plans, executes, and commits features.",
    category: "AI",
    zoom: true,
  },
  Tiktok: {
    name: "Tiktok",
    link: "https://www.tiktok.com/",
    image:
      "https://www.pagetraffic.com/blog/wp-content/uploads/2022/06/new-latest-tiktok-logo-png.png",
    description:
      "Short-form video platform with highly personalized, algorithmic content feed.",
    category: "Social",
    zoom: false,
  },
  X: {
    name: "X",
    link: "https://x.com/",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/X_logo.jpg/1200px-X_logo.jpg",
    description:
      'Rebranded Twitter for real-time posts and Musk’s "everything-app" vision.',
    category: "Social",
    zoom: false,
  },
};
