// import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const clientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        const secret = process.env.GOOGLE_SECRET_KEY
        const refreshToken = await request.json();
        
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

        const url = 'https://www.googleapis.com/oauth2/v4/token' + new URLSearchParams(
            {
                client_id: clientID,
                client_secret: secret,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            }
        ).toString()
        const data = await fetch(url)
        .then(response => response.json());

        console.log("Fetched from " + url)
        console.log(data);
        return NextResponse.json({
            access_token: data.access_token,
            refresh_token: data.refresh_token || refreshToken, // Keep old refresh token if new one not provided
            expires_in: data.expires_in,
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
      }
}