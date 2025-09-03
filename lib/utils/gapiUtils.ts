export const initializeGoogleServices = async () => {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    console.log("Initializing Google Services...");
    if (process.env.NODE_ENV === "development") {
      console.log("Client ID exists:", !!clientId);
      console.log("API Key exists:", !!apiKey);
    }

    if (!clientId || !apiKey) {
      console.error(
        "Missing Google Client ID or API Key in environment variables"
      );
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
        script.onerror = () =>
          reject(new Error("Failed to load Google API script"));
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

export const requestGoogleOAuth = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      callback: (tokenResponse: google.accounts.oauth2.TokenResponse) => {
        console.log("Sign-in token response:", tokenResponse);
        if (tokenResponse.access_token) {
          localStorage.setItem(
            "google_access_token",
            tokenResponse.access_token
          );
          console.log("Successfully signed in and got access token");
          resolve(true);
        } else if (tokenResponse.error) {
          console.error("OAuth error:", tokenResponse.error);
          reject(new Error(`OAuth error: ${tokenResponse.error}`));
        } else {
          console.error("No access token received");
          resolve(false);
        }
      },
      error_callback: (error: google.accounts.oauth2.ClientConfigError) => {
        console.error("OAuth error:", error);
        reject(new Error(`OAuth error: ${error.message || "Unknown error"}`));
      },
    });
    try {
      // This opens the OAuth popup
      if (window.gapi.client.getToken() == null) {
        client.requestAccessToken({ prompt: "consent" });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        client.requestAccessToken({ prompt: "" });
      }
    } catch (error) {
      reject(error);
    }
  });
};
