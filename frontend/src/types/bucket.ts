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
  private: boolean;
  likes: string[];
  iterations: string[];
}

export interface UpdateBucket {
  name: string;
  description: string;
  private: boolean;
  tags?: string[];
}
