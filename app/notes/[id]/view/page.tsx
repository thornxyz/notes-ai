"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { useState } from "react";
import axios from "axios";
import { Note } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ViewNotePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const { data: note, isLoading } = useQuery<Note>({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 0, // Consider the data stale immediately
    refetchOnMount: true, // Refetch when component mounts
  });

  const {
    data: summary,
    isPending: isGeneratingSummary,
    mutate: generateSummary,
  } = useMutation({
    mutationFn: async () => {
      if (!note?.content) throw new Error("No content to summarize");
      const { data } = await axios.post(
        "/api/summary",
        { content: note.content },
        { headers: { "Content-Type": "application/json" } }
      );
      return data.summary;
    },
    onError: (error: Error) => {
      setSummaryError(error.message || "Failed to generate summary");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Failed to delete note", error);
    },
  });

  const handleEdit = () => {
    router.push(`/notes/${id}/edit`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="space-y-6 mx-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/dashboard"
              className="p-2 mt-2 rounded-md hover:bg-muted transition"
            >
              <ArrowLeft />
            </Link>
            <h1 className="text-3xl font-bold ">{note.title}</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            Created on {format(new Date(note.created_at), "MMMM d, yyyy")}
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none border p-4 rounded-lg">
          <p className="whitespace-pre-wrap">{note.content}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Summary</h2>
            {!summary && (
              <Button
                onClick={() => generateSummary()}
                disabled={isGeneratingSummary}
                variant="secondary"
                className="cursor-pointer"
              >
                {isGeneratingSummary ? "Generating..." : "Generate Summary"}
              </Button>
            )}
          </div>

          {isGeneratingSummary && (
            <div className="border p-4 rounded-lg animate-pulse">
              Generating summary...
            </div>
          )}

          {summaryError && (
            <div className="border border-red-200 p-4 rounded-lg bg-red-50 text-red-600">
              {summaryError}
              <Button
                onClick={() => generateSummary()}
                variant="ghost"
                className="ml-4 text-red-600 hover:bg-red-100 cursor-pointer"
              >
                Try Again
              </Button>
            </div>
          )}

          {summary && (
            <div className="prose prose-sm dark:prose-invert max-w-none border p-4 rounded-lg bg-muted/50">
              <p>{summary}</p>
              <Button
                onClick={() => generateSummary()}
                variant="outline"
                className="mt-4 ml-auto block cursor-pointer"
                size="sm"
              >
                Regenerate
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-between">
          <Button onClick={handleEdit} className="cursor-pointer">
            Edit Note
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="cursor-pointer"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Note"}
          </Button>
        </div>
      </div>
    </div>
  );
}
