"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";

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

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) throw new Error("Not authenticated");

        const fileExt = file.name.split(".").pop();
        const fileName = `${sessionData.session.user.id}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("avatars")
          .upload(fileName, file, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({ image_url: publicUrl })
          .eq("id", sessionData.session.user.id)
          .select("*")
          .single<User>();

        if (updateError) throw updateError;
        return updatedProfile;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      setEditingImage(false);
    },
    onError: (error) => {
      console.error("Failed to upload avatar:", error);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    uploadAvatarMutation.mutate(file);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="space-y-8">
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
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Picture
              </label>
              {!editingImage && !editing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingImage(true)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>
            {editingImage ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading || uploadAvatarMutation.isPending}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setEditingImage(false)}
                    disabled={uploading || uploadAvatarMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
                {(uploading || uploadAvatarMutation.isPending) && (
                  <p className="text-sm text-muted-foreground">
                    Uploading image...
                  </p>
                )}
                {uploadAvatarMutation.isError && (
                  <p className="text-sm text-red-500">
                    Failed to upload image. Please try again.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Click edit to upload a new profile picture
              </div>
            )}
          </div>

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
    </div>
  );
}
