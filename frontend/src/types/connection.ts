type ConnectionData = {
  description: string;
};

type Connection = {
  connectionId: string;
  webId: string;
  "data.description": string;
  fromSourceId: string;
  toSourceId: string;
  created: Date;
  updated: Date;
};

type CreateConnection = {
  webId: string;
  fromSourceId: string;
  toSourceId: string;
  data: ConnectionData;
};

type UpdateConnection = {
  name: string;
  description: string;
};

type DeleteConnection = {
  connectionId: string;
};

export type {
  Connection,
  ConnectionData,
  CreateConnection,
  UpdateConnection,
  DeleteConnection,
};
