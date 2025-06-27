export type Contributor = {
    contributorId: string;
    userId?: string;
    webId: string;
    accessLevel: "read" | "write" | "owner";
    invitedAt: string;
    acceptedAt?: string | null;
    pending: boolean;
    invitedBy: string;
}
