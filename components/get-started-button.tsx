// components/get-started-button.tsx
'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Simple inline spinner component
function ButtonSpinner() {
  return (
    <div className="flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
    </div>
  );
}

export function GetStartedButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
        const supabase = createClient();
        const { data } = await supabase.auth.getClaims();
        const user = data?.claims;
        if (!user) {
          router.replace("/login");
        } else {
          router.push("/dashboard");
        }
    } catch (error) {
        console.error("Error checking auth:", error);
        router.replace("/login");
    }
  };
  
  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? <ButtonSpinner /> : "Get Started"}
    </Button>
  );
}