"use client";
import type { JwtPayload, JwtHeader } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import React, { useEffect, useState } from "react";
import Calendar from "@/components/calendar";
import { Button } from "@/components/ui/button";

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
	isGcal:boolean;
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
    const [isLoading, setIsLoading] = useState(true); // Add loading state

	useEffect(() => {
		const handleAuth = async () => {
            try {
                const supabase = createClient(); // Remove await here
                const { data: authResponse, error: authError } = await supabase.auth.getClaims();
                
                console.log("Auth check result:", { authResponse, authError });
                
                if (authError || !authResponse?.claims) {
                    console.log("No authentication found, allowing anonymous access");
                    // User is not authenticated, but we allow anonymous access
                    setAuthData(null);
                } else {
                    console.log("User authenticated:", authResponse.claims);
                    setAuthData(authResponse);
                    
                    // Get Google access token from localStorage
                    const googleToken = localStorage.getItem("google_access_token");
                    if (googleToken) {
                        setAccessToken(googleToken);
                    }
                }
            } catch (error) {
                console.error("Auth error:", error);
                setAuthData(null);
            } finally {
                setIsLoading(false);
            }
        };
        
        handleAuth();
	}, []);

	// Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div>Loading...</div>
            </div>
        );
    }

	return (
		<div className="flex-1 w-full flex flex-col gap-12">
			<div className="flex flex-row w-full">
				<div className="flex-3 bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
					<Calendar
						accessToken={accessToken}
						availableSlots={availableSlots}
						setAvailableSlots={setAvailableSlots}
					/>
				</div>
				<div className="flex-3 border-solid border-2">
					<Button>
						Submit Availability
					</Button>
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
