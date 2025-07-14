

export type ConnectedFeed = {
    feedId: string;
    clientId: string;
    feedType: string;
    createdAt: string;
    updatedAt: string;
    disabled: boolean;
    visibility: "Public" | "Private";
};
