"use client";
import { redirect } from "next/navigation";
import type { JwtPayload, JwtHeader } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import React, { useEffect, useState } from "react";
import Calendar from "@/components/ui/calendar";

interface UserInfo {
	name: string;
	email: string;
	availableSlots: any[];
}

interface AvailabilitySlot {
	id: string;
	title: string;
	start: Date;
	end: Date;
	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;
}
type AuthData = {
	claims: JwtPayload;
	header: JwtHeader;
	signature: Uint8Array<ArrayBufferLike>;
} | null;

export default function ProtectedPage() {
	const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	const [authData, setAuthData] = useState<AuthData | null>(null);
	const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

	useEffect(() => {
		const handleAuth = async () => {
			const supabase = await createClient();
			// Handle Authentication, redirecting to login if not logged in
			const { data: authResponse, error: authError } = await supabase.auth.getClaims();
			if (authError || !authResponse?.claims) {
				redirect("/auth/login");
			} else {
				setAuthData(authResponse);
				// Get Google access token from localStorage
				const googleToken = localStorage.getItem("google_access_token");
				if (googleToken) {
					setAccessToken(googleToken);
				}
			}
		};
		handleAuth();
	}, []);

	return (
		<div className="flex-1 w-full flex flex-col gap-12">
			<div className="w-full">
				<div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
					<Calendar
						accessToken={accessToken}
						availableSlots={availableSlots}
						setAvailableSlots={setAvailableSlots}
					/>
					<InfoIcon size="16" strokeWidth={2} />
					This is a protected page that you can only see as an authenticated user
				</div>
			</div>
			<div className="flex flex-col gap-2 items-start">
				<h2 className="font-bold text-2xl mb-4">Your user details</h2>
				<pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
					{JSON.stringify(authData ? authData.claims : "not yet signed in", null, 2)}
				</pre>
			</div>
		</div>
	);
}
