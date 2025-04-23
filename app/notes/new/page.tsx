"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/app/hook/useNotes";

export default function NewNotePage() {
  const router = useRouter();
  const { createNote } = useNotes();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      await createNote.mutateAsync({ title, content });
      router.push("/dashboard");
    } catch {
      setError("Failed to create note");
    }
  };

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
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createNote.isPending}>
            {createNote.isPending ? "Creating..." : "Create Note"}
          </Button>
        </div>
      </div>
    </div>
  );
}
