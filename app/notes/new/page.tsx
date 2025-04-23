"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function Page() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleCreateNote = async () => {
    setLoading(true);
    setErrorMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("You must be logged in to create a note.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("notes").insert([
      {
        user_id: user.id,
        title,
        content,
      },
    ]);

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Create a New Note</h1>

      <div className="space-y-4">
        <Input
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          placeholder="Write your note here..."
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <Button
          onClick={handleCreateNote}
          disabled={loading || !title.trim() || !content.trim()}
          className="w-full"
        >
          {loading ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </div>
  );
}
