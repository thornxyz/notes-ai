"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function EditNotePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Note not found.");
      } else {
        setTitle(data.title);
        setContent(data.content);
      }
      setLoading(false);
    };

    if (id) fetchNote();
  }, [id, supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("notes")
      .update({ title, content })
      .eq("id", id);

    if (!error) {
      router.push("/dashboard");
    } else {
      setError("Failed to save note.");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (!error) {
      router.push("/dashboard");
    } else {
      setError("Failed to delete note.");
    }
    setDeleting(false);
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4 space-y-4">
      <h1 className="text-3xl font-bold">Edit Note</h1>

      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Content"
        value={content}
        rows={10}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-4">
          <Button
            className="cursor-pointer"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </div>
        <Button
          className="cursor-pointer"
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Note"}
        </Button>
      </div>
    </div>
  );
}
