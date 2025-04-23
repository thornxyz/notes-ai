import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useImageUpload } from "./component"
import { ImagePlus, X, Upload, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import { v4 as uuidv4 } from 'uuid'; 
import { User } from "@/types";

export function ImageUploadDemo() {
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload({
    onUpload: (url: string) => console.log("Uploaded image URL:", url),
  })

  const [isDragging, setIsDragging] = useState(false)

  const supabase = createClient()

  const queryClient = useQueryClient()

  const updateProfileMutation = useMutation({
    mutationFn: async (image_url: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) throw new Error("Not authenticated");

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({ image_url })
        .eq("id", sessionData.session.user.id)
        .select("*")
        .single<User>();

      if (error) throw error;
      return updatedProfile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      console.log("Profile updated with new image URL:", data.image_url);
    },
    onError: (error) => {
      console.error("Failed to update profile with new image URL:", error);
    },
  });

  const uploadImageMutation: UseMutationResult<string, Error, File, unknown> = useMutation({
    mutationFn: async (file: File) => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session?.user) throw new Error("Not authenticated")

      const fileExt = file.name.split(".").pop()
      const fileName = `${sessionData.session.user.id}-${uuidv4()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      return publicUrl
    },
    onSuccess: (publicUrl) => {
      console.log("Image uploaded successfully:", publicUrl)
      handleRemove()
    },
    onError: (error) => {
      console.error("Failed to upload image:", error)
    },
  })

  const handleSave = () => {
    console.log("Save button clicked");
    if (fileInputRef.current?.files?.[0]) {
      console.log("File selected:", fileInputRef.current.files[0]);
      uploadImageMutation.mutate(fileInputRef.current.files[0], {
        onSuccess: (publicUrl) => {
          console.log("Image uploaded successfully:", publicUrl);
          // Use the updateProfileMutation to update the profile
          updateProfileMutation.mutate(publicUrl);
          handleRemove();
        },
      });
    } else {
      console.log("No file selected");
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith("image/")) {
        const fakeEvent = {
          target: {
            files: [file],
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        handleFileChange(fakeEvent)
      }
    },
    [handleFileChange],
  )

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload New Avatar</h3>
        <p className="text-sm text-muted-foreground">
          Supported formats: JPG, PNG, GIF
        </p>
      </div>

      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
            isDragging && "border-primary/50 bg-primary/5",
          )}
        >
          <div className="rounded-full bg-background p-3 shadow-sm">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Click to select</p>
            <p className="text-xs text-muted-foreground">
              or drag and drop file here
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="group relative h-64 overflow-hidden rounded-lg border">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleThumbnailClick}
                className="h-9 w-9 p-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {fileName && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="truncate">{fileName}</span>
              <button
                onClick={handleRemove}
                className="ml-auto rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {previewUrl && (
        <Button onClick={handleSave} disabled={uploadImageMutation.status === 'pending'}>
          {uploadImageMutation.status === 'pending' ? "Uploading..." : "Upload Image"}
        </Button>
      )}
    </div>
  )
} 