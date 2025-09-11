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
    await waitForGapi();

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

function waitForGapi(): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max (50 * 100ms)

    const checkGapi = () => {
      attempts++;

      // Timeout check
      if (attempts > maxAttempts) {
        reject(
          new Error("Timeout: Google API failed to load after 10 seconds")
        );
        return;
      }

      // Check if running in browser
      if (typeof window === "undefined") {
        reject(new Error("Not running in browser environment"));
        return;
      }

      if (window.gapi && window.gapi.client && window.gapi.client.calendar) {
        resolve();
      } else if (window.gapi && window.gapi.client) {
        // gapi.client exists but calendar API not loaded yet
        setTimeout(checkGapi, 100);
      } else if (window.gapi) {
        // gapi exists but client not ready, wait a bit more
        setTimeout(checkGapi, 100);
      } else {
        reject(new Error("Google API not loaded"));
      }
    };
    checkGapi();
  });
}