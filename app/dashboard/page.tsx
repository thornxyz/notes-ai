"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError("Failed to fetch notes.");
      } else {
        setNotes(data as Note[]);
      }

      setLoading(false);
    };

    fetchNotes();
  }, [router, supabase]);

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Notes</h1>
        <Button
          className="cursor-pointer"
          onClick={() => router.push("/notes/new")}
        >
          New Note
        </Button>
      </div>

      {loading && <p>Loading notes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && notes.length === 0 && (
        <p>You haven&apos;t created any notes yet.</p>
      )}

      <div className="grid gap-4">
        {notes.map((note) => (
          <Link key={note.id} href={`/notes/${note.id}/edit`}>
            <div className="border border-border rounded-xl p-4 shadow-sm bg-card hover:shadow-md transition cursor-pointer">
              <h2 className="text-xl font-semibold">{note.title}</h2>
              <p className="text-muted-foreground mt-2 line-clamp-3">
                {note.content}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
