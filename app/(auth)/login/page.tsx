'use client'
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
	const router = useRouter();

	const handleAnonymousAccess = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously()
    if (error) throw error;
		console.log("Navigating to /protected");
		router.push("/protected");
	};

	return (
		<div className="flex items-center justify-center min-h-screen p-6">
			<div className="w-full max-w-sm space-y-6">
				<LoginForm />
				<div className="pt-[1px]">
					<Button className="w-full" variant="outline" onClick={handleAnonymousAccess}>
						Continue Without An Account
					</Button>
				</div>
			</div>
		</div>
	);
}
