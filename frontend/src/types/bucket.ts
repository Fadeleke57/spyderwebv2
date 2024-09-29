export interface Bucket {
  bucketId: string;
  name: string;
  description: string;
  tags: string[];
  userId: string;
  articleIds: string[]; //list of article ids to fetch from neo4j
  imageKeys: string[];
  created: string;
  updated: string;
  private: boolean;
}
