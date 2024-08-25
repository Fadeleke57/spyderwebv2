import politics from '@/assets/politics.webp'
import world from '@/assets/world.webp'
import business from '@/assets/business.jpg'
import sports from '@/assets/sports.webp'
import science from '@/assets/science.webp'
import climate from '@/assets/climate.webp'
import health from '@/assets/health.webp'
import entertainment from '@/assets/entertainment.webp'
import tech from '@/assets/tech.webp'
import { StaticImageData } from "next/image";

export interface Topic {
  name: string;
  image: StaticImageData;
}

export const topics = [
    {
        name: "Politics",
        image: politics
    }, 
    {
        name: "World",
        image: world  
    },
    {
        name: "Business",
        image: business
    },
    {
        name: "Sports",
        image: sports
    },
    {
        name: "Science",
        image: science
    }, 
    {
        name: "Climate",
        image: climate
    }, 
    {
        name: "Health",
        image: health
    },
    {
        name: "Entertainment",
        image: entertainment
    }, 
    {
        name: "Tech",
        image: tech
    }
]