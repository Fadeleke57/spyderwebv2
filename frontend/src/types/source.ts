export type Source = {
  sourceId: string;
  bucketId: string;
  name: string;
  url: string;
  type: string;
  created_at: Date;
  updated_at: Date;
  size?: number;
};

export type SourceAsNode = {
  sourceId: string;
  bucketId: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  created_at: Date;
  updated_at: Date;
  x: number;
  y: number;
};
