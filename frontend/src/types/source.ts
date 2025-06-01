export interface Source {
  sourceId: string;
  webId: string;
  userId: string;
  name: string;
  url: string;
  content: string | null;
  size: number;
  type: string;
  created: Date;
  updated: Date;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  favicon?: string;
  description?: string;
}

export interface SourceAsNode extends Source {
  x: number;
  y: number;
}
