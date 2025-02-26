export interface Source {
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

export interface SourceAsNode extends Source {
  x: number;
  y: number;
}
