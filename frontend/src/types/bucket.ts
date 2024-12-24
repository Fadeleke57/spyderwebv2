export interface Bucket {
  bucketId: string;
  name: string;
  description: string;
  tags: string[];
  userId: string;
  sourceIds?: string[]; //list of misc source ids
  imageKeys: string[];
  created: string;
  updated: string;
  visibility: "Private" | "Public" | "Invite";
  likes: string[];
  iterations: string[];
  iteratedFrom?: string;
}

export interface UpdateBucket {
  name: string;
  description: string;
  visibility: "Private" | "Public" | "Invite";
  tags?: string[];
}

export type BucketTag = {
  value: string;
  label: string;
};

export const tagsList: BucketTag[] = [
  {
    value: "Research",
    label: "research",
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
    value: "Economy",
    label: "economy",
  },
  {
    value: "Food",
    label: "food",
  },
  {
    value: "Travel",
    label: "travel",
  },
  {
    value: "Health",
    label: "health",
  },
  {
    value: "Entertainment",
    label: "entertainment",
  },
  {
    value: "Sports",
    label: "sports",
  },
  {
    value: "World",
    label: "world",
  },
  {
    value: "Other",
    label: "other",
  },
];
