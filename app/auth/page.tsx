"use client";

import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/utils/supabase/client";

function page() {
  const handleGoogleSignIn = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      console.log("Sign in successful:", data);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="flex items-center justify-center w-full mt-30">
      <div className="w-96 rounded-md border p-8 space-y-5">
        <div className="flex items-center gap-2">
          <KeyRound />
          <h1 className="text-2xl font-bold">Next + Supabase</h1>
        </div>
        <p className="text-sm text-gray-300">Register/Sign In Today 👇</p>
        <Button
          className="w-full flex items-center cursor-pointer"
          variant="outline"
          onClick={handleGoogleSignIn}
        >
          <FcGoogle />
          Google
        </Button>
      </div>
    </div>
  );
}
export default page;
