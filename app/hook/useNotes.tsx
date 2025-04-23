import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Note } from "@/types";

export function useNotes() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createNote = useMutation({
    mutationFn: async (note: { title: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("notes")
        .insert([{ ...note, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: {
      id: string;
      title: string;
      content: string;
    }): Promise<Note> => {
      const { data, error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch both queries
      queryClient.invalidateQueries({ 
        queryKey: ["notes"],
        refetchType: "all"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["note", data.id],
        refetchType: "all"
      });

      // Update the cache immediately with the new data
      queryClient.setQueryData(["note", data.id], data);
      queryClient.setQueryData<Note[]>(["notes"], (oldNotes) => {
        if (!oldNotes) return [data];
        return oldNotes.map((note) => 
          note.id === data.id ? data : note
        );
      });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      // Invalidate and refetch the notes list
      queryClient.invalidateQueries({ 
        queryKey: ["notes"],
        refetchType: "all"
      });
      // Remove the deleted note from cache
      queryClient.removeQueries({ queryKey: ["note", id] });
    },
  });

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
  };
} 