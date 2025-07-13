

export type Feed = {
    feedId: string;
    clientId?: string;
    feedType: string;
    createdAt: string;
    updatedAt: string;
    visibility: "Public" | "Private";
};
