import { useState, useEffect } from 'react';

import { createClient } from "@/lib/supabase/client";
import type { JwtPayload, JwtHeader } from "@supabase/supabase-js";

type AuthData = {
	claims: JwtPayload;
	header: JwtHeader;
	signature: Uint8Array<ArrayBufferLike>;
} | null;


export const useAuth = () => {
	const [authData, setAuthData] = useState<AuthData | null>(null);
	const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true); // Add loading state

	useEffect(() => {
		const handleAuth = async () => {
			try {
				const supabase = createClient();
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
    return {
        authData,
        accessToken,
        isLoading,
    }
}