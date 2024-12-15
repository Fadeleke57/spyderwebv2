export interface Bucket {
  bucketId: string;
  name: string;
  description: string;
  tags: string[];
  userId: string;
  articleIds: string[]; //list of article ids to fetch from neo4j
  sourceIds?: string[]; //list of misc source ids
  imageKeys: string[];
  created: string;
  updated: string;
  visibility: "Private" | "Public" | "Invite";
  likes: string[];
  iterations: string[];
}

export interface UpdateBucket {
  name: string;
  description: string;
  visibility: "Private" | "Public" | "Invite";
  tags?: string[];
}
