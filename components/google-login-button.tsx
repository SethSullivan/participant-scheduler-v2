"use client";

import { cn } from "@/lib/utils/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function GoogleLoginButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const supabase = createClient();
    
    const redirectURL = process.env.NODE_ENV === "development" 
      ? "http://localhost:3000/dashboard"
      : "https://participantscheduler.com/dashboard";
    
    try {
      const scopes = ['openid', 'email', 'profile', 
        'https://www.googleapis.com/auth/calendar.readonly', 
        'https://www.googleapis.com/auth/calendar.freebusy',
        'https://www.googleapis.com/auth/calendar.calendarlist',
        'https://www.googleapis.com/auth/calendar.events.freebusy',
        'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
        'https://www.googleapis.com/auth/calendar.calendars.readonly',
        'https://www.googleapis.com/auth/calendar.events.public.readonly',
      ]
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL,
          scopes: scopes.join(" "),
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
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Button className="bg-blue-600 hover:bg-blue-800" onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign-In With Google"}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}