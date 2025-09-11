// import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const clientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        const secret = process.env.GOOGLE_SECRET_KEY
        const { refreshToken } = await request.json();
        
        if (!refreshToken) {
            return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
        }

        if (!clientID){
            console.error("No Google clientID")
            return NextResponse.json(
                { error: "Missing google clientID" },
                { status: 400 }
            ); 
        }
        if (!secret) {
            console.error("No secret")
            return NextResponse.json(
                { error: "Missing google client secret" },
                { status: 400 }
            );
        }

        // Use the correct endpoint and method
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientID,
                client_secret: secret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google OAuth error response:', errorText);
            return NextResponse.json(
                { error: 'Failed to refresh token', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Token refresh successful:', data);

        return NextResponse.json({
            access_token: data.access_token,
            refresh_token: data.refresh_token || refreshToken,
            expires_in: data.expires_in,
        });


    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
      }
}