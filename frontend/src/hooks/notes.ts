import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Bucket, UpdateBucket } from "@/types/bucket";
import { Article } from "@/types/article";

export const useFetchNotes = (bucketId: string) => {
    const [notes, setNotes] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/notes/${bucketId}/`);
            setNotes(response.data.result);
        } catch (err) {
            setError("Failed to fetch bucket data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const refetch = () => {
        setLoading(true);
        fetchData();
    };
    useEffect(() => {
        fetchData();
    }, []);
    return { notes, loading, error, refetch };
}

export const useAddNote = (bucketId: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const addNote = async (note: string) => {
        setLoading(true);
        try {
            const response = await api.patch(`/buckets/add/note/${bucketId}`, { note });
        } catch (err) {
            setError("Failed to add note to bucket");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    return { addNote, loading, error };
}

export const useUpdateNote = (bucketId: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const updateNote = async (note: string) => {
        setLoading(true);
        try {
            const response = await api.patch(`/buckets/update/note/${bucketId}`, { note });
        } catch (err) {
            setError("Failed to update note to bucket");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    return { updateNote, loading, error };
}