"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";

export default function ViewNotePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const { data: note, isLoading } = useQuery({
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
  });

  const handleEdit = () => {
    router.push(`/notes/${id}/edit`);
  };

  const handleBack = () => {
    router.push("/dashboard");
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
          <h1 className="text-3xl font-bold">{note.title}</h1>
          <p className="text-sm text-muted-foreground">
            Created on {format(new Date(note.created_at), "MMMM d, yyyy")}
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none border p-2 rounded-lg">
          <p className="whitespace-pre-wrap">{note.content}</p>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleEdit}>Edit Note</Button>
          <Button variant="outline" onClick={handleBack}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
