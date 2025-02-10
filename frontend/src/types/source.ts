export type Source = {
  sourceId: string;
  bucketId: string;
  userId?: string;
  name: string;
  url: string;
  type: string;
  created: Date;
  updated: Date;
  size?: number;
  content?: string;
};

export type SourceAsNode = {
  sourceId: string;
  bucketId: string;
  userId: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  content?: string;
  created: Date;
  updated: Date;
  x: number;
  y: number;
};
