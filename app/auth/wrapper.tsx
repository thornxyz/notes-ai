"use client";

import { Suspense } from "react";
import AuthForm from "./authform";

export default function AuthFormWrapper() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading auth...</div>}>
      <AuthForm />
    </Suspense>
  );
}
