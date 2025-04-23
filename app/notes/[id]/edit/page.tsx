"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/app/hook/useNotes";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Note } from "@/types";

export default function EditNotePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const { updateNote, deleteNote } = useNotes();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const { isLoading } = useQuery<Note>({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setTitle(data.title);
        setContent(data.content);
        return data;
      }
      throw new Error("Note not found");
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const handleSave = async () => {
    try {
      await updateNote.mutateAsync({ id, title, content });
      router.push("/dashboard");
    } catch {
      setError("Failed to save note");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote.mutateAsync(id);
      router.push("/dashboard");
    } catch {
      setError("Failed to delete note");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="space-y-4 mx-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="font-semibold h-10 px-4 !text-xl"
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          className="h-96 resize-y overflow-auto leading-relaxed px-4 py-3 !text-base"
        />

        <div className="flex justify-between">
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={updateNote.isPending}
              className="cursor-pointer"
            >
              {updateNote.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateNote.isPending || deleteNote.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteNote.isPending}
            className="cursor-pointer"
          >
            {deleteNote.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
