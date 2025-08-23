"use client";

import { cn } from "@/lib/utils/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
	const router = useRouter();

	const initializeGoogleServices = async () => {
		try {
			const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
			const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

			console.log("Initializing Google Services...");
			if (process.env.NODE_ENV === "development") {
				console.log("Client ID exists:", !!clientId);
				console.log("API Key exists:", !!apiKey);
			}

			if (!clientId || !apiKey) {
				console.error("Missing Google Client ID or API Key in environment variables");
				return;
			}
			// Load Google Identity Services script
			if (!window.google) {
				await new Promise<void>((resolve, reject) => {
					const script = document.createElement("script");
					script.src = "https://accounts.google.com/gsi/client";
					script.onload = () => resolve();
					script.onerror = () =>
						reject(new Error("Failed to load Google Identity Services script"));
					document.head.appendChild(script);
				});
			}
			// Load Google API script
			if (!window.gapi) {
				await new Promise<void>((resolve, reject) => {
					const script = document.createElement("script");
					script.src = "https://apis.google.com/js/api.js";
					script.onload = () => resolve();
					script.onerror = () => reject(new Error("Failed to load Google API script"));
					document.head.appendChild(script);
				});
			}

			// Wait for both to be available
			const waitForGoogleServices = () => {
				return new Promise<void>((resolve) => {
					const checkInterval = setInterval(() => {
						if (window.google && window.google.accounts && window.gapi) {
							clearInterval(checkInterval);
							resolve();
						}
					}, 100);
				});
			};

			await waitForGoogleServices();
			console.log("Google services loaded");

			// Initialize Google API client
			await new Promise<void>((resolve, reject) => {
				window.gapi.load("client", async () => {
					try {
						await window.gapi.client.init({
							apiKey: apiKey,
							discoveryDocs: [
								"https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
							],
						});
						console.log("Google API client initialized");
						resolve();
					} catch (error) {
						console.error("Failed to initialize Google API client:", error);
						reject(error);
					}
				});
			});

			console.log("Google Services initialized successfully");
		} catch (error) {
			console.error("Error initializing Google Services:", error);
		}
	};

	const createGoogleClient = async () => {
		const client = window.google.accounts.oauth2.initTokenClient({
			client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
			scope: "https://www.googleapis.com/auth/calendar.readonly",
			callback: (tokenResponse: any) => {
				console.log("Sign-in token response:", tokenResponse);
				if (tokenResponse.access_token) {
					setAccessToken(tokenResponse.access_token);
					console.log("Successfully signed in and got access token");
				} else {
					console.error("No access token received");
				}
			},
			error_callback: (error: any) => {
				console.error("OAuth error:", error);
			},
		});
		return client
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;

			// Only do this if it's me for now...
			if (email == "sethsullivan99@gmail.com") {
				await initializeGoogleServices();
				const client = await createGoogleClient();
				client.requestAccessToken();
			}
			// Update this route to redirect to an authenticated route. The user already has an active session.
			router.push("/protected");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
									<Link
										href="/auth/forgot-password"
										className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</Link>
								</div>
								<Input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							{error && <p className="text-sm text-red-500">{error}</p>}
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Logging in..." : "Login"}
							</Button>
						</div>
						<div className="mt-4 text-center text-sm">
							Don&apos;t have an account?{" "}
							<Link href="/auth/sign-up" className="underline underline-offset-4">
								Sign up
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
