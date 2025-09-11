"use client";

import { cn } from "@/lib/utils/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function GoogleLoginButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session); 
      
      if (session && session.provider_token) {
        localStorage.setItem('google_access_token', session.provider_token);
        console.log('Stored access token:', session.provider_token); // Debug log
      }
      
      if (session && session.provider_refresh_token) {
        localStorage.setItem('google_refresh_token', session.provider_refresh_token);
      }
      
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem("session", JSON.stringify(session));
        // Redirect to dashboard after successful sign in
        router.push('/dashboard');
      }
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_refresh_token');
        localStorage.removeItem('session');
      }
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const supabase = createClient();

    const redirectURL = process.env.NODE_ENV === "development" 
      ? "http://localhost:3000/dashboard"
      : "https://participantscheduler.com/dashboard";

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL,
          scopes: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign-In With Google"}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}