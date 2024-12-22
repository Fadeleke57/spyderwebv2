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
