
export type Connection = {
  connectionId: string;
  webId: string;
  description: string;
  fromSourceId: string;
  toSourceId: string;
  created: Date;
  updated: Date;
  aiGenerated?: boolean;
};

export type CreateConnection = {
  webId: string;
  fromSourceId: string;
  toSourceId: string;
  description: string;
};

export type UpdateConnection = {
  name: string;
  description: string;
};

export type DeleteConnection = {
  connectionId: string;
};
