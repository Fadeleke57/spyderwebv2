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
  txt: [".txt", ".md"],
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
