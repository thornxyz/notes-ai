"use client";

import { useNotes } from "@/app/hook/useNotes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { FaPlus } from "react-icons/fa";

export default function DashboardPage() {
  const { notes, isLoading } = useNotes();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <Link href="/notes/new">
          <Button className="cursor-pointer">
            Create New Note
            <FaPlus className="mt-0.5" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes?.map((note) => (
          <div
            key={note.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <Link href={`/notes/${note.id}/view`}>
              <h2 className="text-xl font-semibold mb-2">{note.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(note.created_at), "MMM d, yyyy")}
              </p>
            </Link>
          </div>
        ))}
      </div>

      {notes?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No notes yet. Create your first note!</p>
        </div>
      )}
    </div>
  );
}
