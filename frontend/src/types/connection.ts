type ConnectionData = {
  name: string;
  description: string;
};

type Connection = {
  connectionId: string;
  bucketId: string;
  data: ConnectionData;
  fromSourceId: string;
  toSourceId: string;
  created: Date;
  updated: Date;
};

type CreateConnection = {
  bucketId: string;
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
