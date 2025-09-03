import { useState, useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import type { JwtPayload, JwtHeader } from "@supabase/supabase-js";

type AuthData = {
	claims: JwtPayload;
	header: JwtHeader;
	signature: Uint8Array<ArrayBufferLike>;
} | null;

export const useAuth = () => {
	const [authData, setAuthData] = useState<AuthData | null>(null);

	useEffect(() => {
		const handleAuth = async () => {
			try {
				const supabase = createClient();
				const { data: authResponse, error: authError } = await supabase.auth.getClaims();

				if (authError || !authResponse?.claims) {
					console.log("No authentication found, allowing anonymous access");
					// User is not authenticated, but we allow anonymous access
					setAuthData(null);
				} else {
					setAuthData(authResponse);
				}
			} catch (error) {
				console.error("Auth error:", error);
				setAuthData(null);
			}
		};

		handleAuth();
	}, []);
	return authData;
};
