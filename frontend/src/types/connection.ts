export type ConnectionData = {
  description: string;
};

export type Connection = {
  connectionId: string;
  webId: string;
  "data.description": string; //hack because of how it's stored in neo4j
  fromSourceId: string;
  toSourceId: string;
  created: Date;
  updated: Date;
};

export type CreateConnection = {
  webId: string;
  fromSourceId: string;
  toSourceId: string;
  data: ConnectionData;
};

export type UpdateConnection = {
  name: string;
  description: string;
};

export type DeleteConnection = {
  connectionId: string;
};
