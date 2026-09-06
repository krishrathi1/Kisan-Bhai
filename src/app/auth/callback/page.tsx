"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeGoogleCodeForSession } from "@/lib/supabase";
import { SplashScreen } from "@/components/splash-screen";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code || typeof window === "undefined") {
        setError("Missing authorization code.");
        return;
      }

      try {
        await exchangeGoogleCodeForSession(code, `${window.location.origin}/auth/callback`, state);
        router.replace("/dashboard");
      } catch (err) {
        console.error("Google OAuth callback failed", err);
        setError(err instanceof Error ? err.message : "Google sign-in failed.");
      }
    };

    run();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-bold">Sign-in failed</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => router.replace("/")}
          >
            Return to sign in
          </button>
        </div>
      </div>
    );
  }

  return <SplashScreen />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
