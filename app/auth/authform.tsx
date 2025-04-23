"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function AuthForm() {
  const params = useSearchParams().get("next");
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: params
            ? `${location.origin}/auth/callback?next=${params}`
            : `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      if (isSigningUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: params
              ? `${location.origin}/auth/callback?next=${params}`
              : `${location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        setErrorMessage(
          "Success! Please check your email to confirm your account."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = params ? decodeURIComponent(params) : "/";
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-md">
        <div className="flex items-center gap-2">
          <KeyRound />
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to Notes
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {isSigningUp
            ? "Create your account below."
            : "Please sign in to continue."}
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
          )}

          <Button
            className="w-full p-4 cursor-pointer"
            onClick={handleEmailAuth}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : isSigningUp
              ? "Sign Up with Email"
              : "Log In with Email"}
          </Button>

          <div className="flex justify-center items-center">
            <button
              onClick={() => setIsSigningUp(!isSigningUp)}
              className="text-base text-muted-foreground hover:underline text-center cursor-pointer"
            >
              {isSigningUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="flex items-center gap-4 ">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            className="w-full p-6 flex items-center justify-center gap-2 cursor-pointer"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <FcGoogle className="text-xl" />
            {isLoading ? "Loading..." : "Continue with Google"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
