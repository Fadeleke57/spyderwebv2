export interface Source {
  sourceId: string;
  webId: string;
  userId?: string;
  name: string;
  url: string;
  content?: string;
  size?: number;
  type: string;
  created: Date;
  updated: Date;
};

export interface SourceAsNode extends Source {
  x: number;
  y: number;
}
