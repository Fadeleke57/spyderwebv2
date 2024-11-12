export type CreateNote = {
    content: string;
    bucketId: string;
    sourceId: string;
};

export type UpdateNote = {
    content: string;
    bucketId: string;
    sourceId: string;
}

export type Note = {
    noteId: string;
    content: string;
    bucketId: string;
    sourceId: string;
    created: string;
    updated: string;
}