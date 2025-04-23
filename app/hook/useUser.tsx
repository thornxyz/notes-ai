"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

const initUser: User = {
  created_at: "",
  display_name: "",
  email: "",
  id: "",
  image_url: "",
};

function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session?.user) {
        const authUser = sessionData.session.user;

        // Get profile data
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (error || !profile) {
          console.error("Failed to fetch profile", error);
          return initUser;
        }

        // Update profile with latest auth data if needed
        if (
          !profile.image_url &&
          (authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture)
        ) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update({
              image_url:
                authUser.user_metadata?.avatar_url ||
                authUser.user_metadata?.picture,
              display_name:
                profile.display_name ||
                authUser.user_metadata?.full_name ||
                authUser.email?.split("@")[0] ||
                "",
            })
            .eq("id", authUser.id)
            .select()
            .single();

          if (updateError) {
            console.error("Failed to update profile", updateError);
            return profile;
          }

          return updatedProfile;
        }

        return profile;
      }

      return initUser;
    },
  });
}

export default useUser;
