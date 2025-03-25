export type Process = {
    jobId: string;
    webId: string;
    status: "pending" | "processing" | "completed" | "failed";
    type: "upload" | "embed" | "connect";
    percentage: number;
    description: string;
    created: Date;
    updated: Date;
    error: string | null | undefined;
    closeModal: boolean | null | undefined;
};