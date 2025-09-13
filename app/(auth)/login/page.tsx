"use client";
import { GoogleLoginButton } from "@/components/google-login-button";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
export default function Page() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div className="flex-col w-full flex items-center justify-center">
        <div className="w-full max-w-sm text-center text-md">
          For Google Calendar integration (recommended)
          <GoogleLoginButton/>
        </div>
        {!showEmailLogin &&
        <div className="w-full max-w-sm pt-6 text-center">
           - or -
        </div>
        }
        {!showEmailLogin &&
        <div className="flex w-full max-w-sm pt-6 items-center justify-center">
           <Button onClick={() => setShowEmailLogin(true)}>
              Login with Email
           </Button>
        </div>
        }
      </div>
      {showEmailLogin  &&
      <div className="flex pt-6">
        <div className="flex w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
      }
    </div>
  );
}
