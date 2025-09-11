"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LogoutButton() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_refresh_token');
        localStorage.removeItem('session');
        localStorage.removeItem('test');
        localStorage.removeItem('google-oauth-data');
      }
    });
    return () => subscription.unsubscribe();
    }, [router]);
  const logout = async () => {
    localStorage.removeItem("google_access_token");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return <Button onClick={logout}>Logout</Button>;
}
