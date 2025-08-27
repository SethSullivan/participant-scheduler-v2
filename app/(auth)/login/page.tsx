'use client'
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
	const router = useRouter();

	return (
		<div className="flex items-center justify-center min-h-screen p-6">
			<div className="w-full max-w-sm space-y-6">
				<LoginForm />
			</div>
		</div>
	);
}
