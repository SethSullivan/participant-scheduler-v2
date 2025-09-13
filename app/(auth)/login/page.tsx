"use client";
import { GoogleLoginButton } from "@/components/google-login-button";
import { LoginForm } from "@/components/login-form";
export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center border-2">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <GoogleLoginButton/>
        </div>
      </div>
    </div>
  );
}
