import politics from "@/assets/politics.webp";
import world from "@/assets/world.webp";
import business from "@/assets/business.jpg";
import sports from "@/assets/sports.webp";
import science from "@/assets/science.webp";
import climate from "@/assets/climate.webp";
import health from "@/assets/health.webp";
import entertainment from "@/assets/entertainment.webp";
import tech from "@/assets/tech.webp";
import { StaticImageData } from "next/image";

export interface Topic {
  name: string;
  image: StaticImageData;
  subtopics: { value: string; label: string }[];
}

export const topicsWithSubtopics = [
  {
    name: "politics",
    image: politics,
    subtopics: [
      { value: "Politics", label: "Politics - All" },
      { value: "republican", label: "Republican" },
      { value: "democrats", label: "Democrats" },
      { value: "2024 Elections", label: "2024 Elections" },
      { value: "Kamala Harris", label: "Kamala Harris" },
      { value: "Donald Trump", label: "Donald Trump" },
    ],
  },
  {
    name: "world",
    image: world,
    subtopics: [
      { value: "World", label: "World - All" },
      { value: "Israel-Hamas War", label: "Israel-Hamas War" },
      { value: "South Korea", label: "South Korea" },
      { value: "Italy", label: "Italy" },
      { value: "Germany", label: "Germany" },
      { value: "Botswana", label: "Botswana" },
    ],
  },
  {
    name: "business",
    image: business,
    subtopics: [
      { value: "Business", label: "Business - All" },
      { value: "Economy", label: "Economy" },
      { value: "Brands", label: "Brands" },
      { value: "Companies", label: "Companies" },
      { value: "The Leadership Brief", label: "Leaders" },
      { value: "Cryptocurrency", label: "Cryptocurrency" },
    ],
  },
  {
    name: "health",
    image: health,
    subtopics: [
      { value: "Health", label: "Health - All" },
      { value: "Disease", label: "Disease" },
      { value: "COVID-19", label: "COVID-19" },
    ],
  },
  {
    name: "science",
    image: science,
    subtopics: [
      { value: "Science", label: "Science - All" },
      { value: "remembrance", label: "Remembrance" },
      { value: "Space", label: "Space" },
    ],
  },
  {
    name: "climate",
    image: climate,
    subtopics: [{ value: "Climate", label: "Climate - All" }],
  },
  {
    name: "entertainment",
    image: entertainment,
    subtopics: [{ value: "Entertainment", label: "Entertainment - All" }],
  },
  {
    name: "technology",
    image: tech,
    subtopics: [
      { value: "Technology", label: "Technology - All" },
      { value: "Artificial Intelligence", label: "Artifical intelligence" },
      { value: "Security", label: "Security" },
    ],
  },
  {
    name: "sports",
    image: sports,
    subtopics: [
      { value: "Sports", label: "Sports - All" },
      { value: "Soccer", label: "Soccer" },
      { value: "Olympics 2024", label: "Olympics 2024" },
    ],
  },
];
