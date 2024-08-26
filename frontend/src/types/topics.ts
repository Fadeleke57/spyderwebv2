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
    name: "Politics",
    image: politics,
    subtopics: [
      { value: "Politics", label: "All" },
      { value: "republican", label: "Republican" },
      { value: "democrats", label: "Democrats" },
      { value: "2024 Elections", label: "2024 Elections" },
      { value: "Kamala Harris", label: "Kamala Harris" },
      { value: "Donald Trump", label: "Donald Trump" },
    ],
  },
  {
    name: "World",
    image: world,
    subtopics: [
      { value: "World", label: "All" },
      { value: "Israel-Hamas War", label: "Israel-Hamas War" },
      { value: "South Korea", label: "South Korea" },
      { value: "Italy", label: "Italy" },
      { value: "Germany", label: "Germany" },
      { value: "Botswana", label: "Botswana" },
    ],
  },
  {
    name: "Business",
    image: business,
    subtopics: [
      { value: "Business", label: "All" },
      { value: "Economy", label: "Economy" },
      { value: "Brands", label: "Brands" },
      { value: "Companies", label: "Companies" },
      { value: "The Leadership Brief", label: "Leaders" },
      { value: "Cryptocurrency", label: "Cryptocurrency" },
    ],
  },
  {
    name: "Health",
    image: health,
    subtopics: [
      { value: "Health", label: "All" },
      { value: "Disease", label: "Disease" },
      { value: "COVID-19", label: "COVID-19" },
    ],
  },
  {
    name: "Science",
    image: science,
    subtopics: [
      { value: "Science", label: "All" },
      { value: "remembrance", label: "Remembrance" },
      { value: "Space", label: "Space" },
    ],
  },
  {
    name: "Climate",
    image: climate,
    subtopics: [{ value: "Climate", label: "All" }],
  },
  {
    name: "Entertainment",
    image: entertainment,
    subtopics: [{ value: "Entertainment", label: "All" }],
  },
  {
    name: "Tech",
    image: tech,
    subtopics: [
      { value: "Artificial Intelligence", label: "AI" },
      { value: "Security", label: "Security" },
    ],
  },
  {
    name: "Sports",
    image: sports,
    subtopics: [
      { value: "Sports", label: "All" },
      { value: "Soccer", label: "Soccer" },
      { value: "Olympics 2024", label: "Olympics 2024" },
    ],
  },
];
