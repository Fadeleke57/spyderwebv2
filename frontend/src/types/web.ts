export interface Web {
  webId: string;
  name: string;
  description: string;
  tags: string[];
  userId: string;
  sourceIds: string[];
  imageKeys: string[];
  created: string;
  updated: string;
  visibility: "Private" | "Public" | "Invite";
  likes: string[];
  iterations: string[];
  iteratedFrom?: string;
  enableAIConnections?: boolean;
  showcase?: boolean;
  pinned?: boolean;
  status: "completed" | "processing" | "failed";
  statusMessage?: string;
}

export interface UpdateWeb {
  name?: string;
  description?: string;
  visibility?: "Private" | "Public" | "Invite";
  enableAIConnections?: boolean;
  tags?: string[];
}

export type WebTag = {
  value: string;
  label: string;
};

export interface CreateWeb {
  title: string;
  description: string;
}
