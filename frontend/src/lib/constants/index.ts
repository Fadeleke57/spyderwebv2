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
  /* uncomment once file2markdown service is implemented
  docs: [".doc", ".docx", ".hwp", ".hwpx"],
  powerpoint: [".ppt", ".pptx"],
  excel: [".xls", ".xlsx"],
  */
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

const mcpClients = [
  {
    name: "Claude",
    link: "https://claude.ai/login?returnTo=%2F%3F#features",
    image:
      "https://pub-4271c874f759418fbdcd18b0e5cbe024.r2.dev/Claude/claude-logo.png",
  },
  {
    name: "Cascade - Windsurf",
    link: "https://windsurf.com/",
    image:
      "https://exafunction.github.io//public/brand/windsurf-black-symbol.png",
  },
  {
    name: "Cursor",
    link: "https://cursor.sh/",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrQ_CU3a6muH84mLfoP6xmM4ZJ9Z6RAXMmdA&s",
  },
  {
    name: "Continue",
    link: "https://continue.dev/",
    image: "https://hub.continue.dev/continue-logo.png",
  },
  {
    name: "Cline",
    link: "https://cline.bot/",
    image:
      "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/cline.png",
  },
  {
    name: "Witsy",
    link: "https://witsyai.com/",
    image: "https://witsyai.com/img/logo.png",
  },
  {
    name: "Encovo",
    link: "https://www.enconvo.com/",
    image: "https://www.enconvo.com/logo.svg",
  },
];

export const feedMap = {
  Claude: {
    name: "Claude",
    link: "https://claude.ai/login?returnTo=%2F%3F#features",
    image:
      "https://pub-4271c874f759418fbdcd18b0e5cbe024.r2.dev/Claude/claude-logo.png",
    description:
      "Claude is a powerful AI assistant that can help you with a wide range of tasks.",
  },
  Windsurf: {
    name: "Cascade - Windsurf",
    link: "https://windsurf.com/",
    image:
      "https://exafunction.github.io//public/brand/windsurf-black-symbol.png",
    description:
      "Windsurf is a powerful AI assistant that can help you with a wide range of tasks.",
  },
  Cursor: {
    name: "Cursor",
    link: "https://cursor.sh/",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrQ_CU3a6muH84mLfoP6xmM4ZJ9Z6RAXMmdA&s",
    description:
      "Cursor is a powerful AI assistant that can help you with a wide range of tasks.",
  },
  Continue: {
    name: "Continue",
    link: "https://continue.dev/",
    image: "https://hub.continue.dev/continue-logo.png",
    description:
      "Continue is a powerful AI assistant that can help you with a wide range of tasks.",
  },
  Cline: {
    name: "Cline",
    link: "https://cline.bot/",
    image:
      "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/cline.png",
    description:
      "Cline is a powerful AI assistant that can help you with a wide range of tasks.",
  },
  Witsy: {
    name: "Witsy",
    link: "https://witsyai.com/",
    image: "https://witsyai.com/img/logo.png",
    description:
      "Witsy is a powerful AI assistant that can help you with a wide range of tasks.",
  },
  Encovo: {
    name: "Encovo",
    link: "https://www.enconvo.com/",
    image: "https://www.enconvo.com/logo.svg",
    description:
      "Encovo is a powerful AI assistant that can help you with a wide range of tasks.",
  },
  Tiktok: {
    name: "Tiktok",
    link: "https://www.tiktok.com/",
    image: "https://www.tiktok.com/favicon.ico",
    description:
      "Tiktok is a social media platform that allows users to share short videos and photos.",
  },
  X: {
    name: "X",
    link: "https://x.com/",
    image: "https://x.com/favicon.ico",
    description:
      "X is a social media platform that allows users to share short videos and photos.",
  },
};
