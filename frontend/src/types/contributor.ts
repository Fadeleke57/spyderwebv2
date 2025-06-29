export type AccessLevel = "read" | "write" | "owner";

export type Contributor = {
    contributorId: string;
    userId?: string;
    username?: string;
    email?: string;
    webId: string;
    accessLevel: AccessLevel;
    invitedAt: string;
    acceptedAt?: string | null;
    pending: boolean;
    invitedBy: string;
}
