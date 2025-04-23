"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";
import { ImageUploadDemo } from "../components/ui/demo";

export default function ProfilePage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionData.session.user.id)
        .single<User>();

      if (error) throw error;
      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) throw new Error("Not authenticated");

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          display_name: data.display_name,
          image_url: data.image_url,
        })
        .eq("id", sessionData.session.user.id)
        .select("*")
        .single<User>();

      if (error) throw error;
      return updatedProfile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      setEditing(false);
      setEditingImage(false);
      setFormData({});
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
    },
  });

  const handleEdit = () => {
    setFormData({
      display_name: profile?.display_name || "",
    });
    setEditing(true);
  };

  const handleSave = () => {
    if (!formData.display_name?.trim()) return;
    updateProfileMutation.mutate({ display_name: formData.display_name });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditingImage(false);
    setFormData({});
  };

  if (isLoading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={profile.image_url} alt={profile.display_name} />
          <AvatarFallback className="text-4xl">
            {profile.email[0].toUpperCase() + profile.email[1].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {editing ? (
              <Input
                value={formData.display_name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name: e.target.value,
                  }))
                }
                placeholder="Enter your display name"
                className="w-64"
              />
            ) : (
              <h1 className="text-3xl font-bold">
                {profile.display_name || "No Name Set"}
              </h1>
            )}
            {!editing && (
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <ImageUploadDemo />

        {editing && (
          <div className="flex gap-4 pt-2">
            <Button
              onClick={handleSave}
              disabled={
                updateProfileMutation.isPending ||
                !formData.display_name?.trim()
              }
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Name"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {updateProfileMutation.isError && (
        <div className="text-red-500 mt-4">
          Failed to update profile. Please try again.
        </div>
      )}
    </div>
  );
}
