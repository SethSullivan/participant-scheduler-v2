import { useState, useEffect } from "react";

export default function useGoogleAccessToken(eventID:string): string | undefined {
    const [accessToken, setAccessToken]       = useState<string | undefined>(undefined);

    // Use localStorage to get google access token and previous availability
    const refreshGoogleAccessToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/refresh-google-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
  
      const data = await response.json();
      
      // Update localStorage with new tokens
      localStorage.setItem('google_access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('google_refresh_token', data.refresh_token);
      }
  
      return data.access_token;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  useEffect(() => {
    const initializeTokens = async () =>{

      const googleAccessToken = localStorage.getItem('google_access_token');
      const googleRefreshToken = localStorage.getItem('google_refresh_token');
      if (googleAccessToken) {
        // Check if token is still valid by making a test request
        try {
          const testResponse = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + googleAccessToken);
          if (testResponse.ok) {
            // Token is still valid
            setAccessToken(googleAccessToken);
            console.log('Existing access token is valid');
          } else {
            throw new Error('Token expired');
          }
        } catch (error) {
          console.log(error);
          
          // Try to refresh the token
          if (googleRefreshToken) {
            const newAccessToken = await refreshGoogleAccessToken(googleRefreshToken);
            if (newAccessToken) {
              setAccessToken(newAccessToken);
              console.log('Successfully refreshed access token');
            } else {
              console.log('Failed to refresh token, user will need to re-authenticate');
              // Clear invalid tokens
              // localStorage.removeItem('google_access_token');
              // localStorage.removeItem('google_refresh_token');
            }
          } else {
            console.log('No refresh token available');
          }
        }
      } else if (googleRefreshToken) {
        // No access token but have refresh token
        console.log('No access token found, attempting to refresh...');
        const newAccessToken = await refreshGoogleAccessToken(googleRefreshToken);
        if (newAccessToken) {
          setAccessToken(newAccessToken);
        }
      }
    }
    initializeTokens();
  }, [eventID]);
  return accessToken
}