'use client'
import { LoginForm } from "@/components/login-form";

export default function Page() {
	return (
		<div className="flex items-center justify-center min-h-screen p-6">
			<div className="w-full max-w-sm space-y-6">
				<LoginForm />
			</div>
		</div>
	);
}
