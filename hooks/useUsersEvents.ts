import { Dispatch, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EventsData } from "@/types/types";

export default function useUsersEvents(
  router: { replace: (url: string) => void },
  setIsLoading: Dispatch<React.SetStateAction<boolean>>,
  setEventsData: Dispatch<React.SetStateAction<EventsData[] | null>>
) {  
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
    const getUsersEvents = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getClaims();
        const user = data?.claims;
        if (!user) {
          router.replace("/login");
          return;
        }
        const { error: eventsError, data: eventsData } = await supabase
          .from("events")
          .select("*")
          .eq("organizer", user.sub);

        if (eventsError) throw eventsError;
        console.log("Events data", eventsData);
        if (eventsData) {
          setEventsData(eventsData);
        }
      } catch (error) {
        console.error("Error loading events:", error);
        setError((error as Error).message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    getUsersEvents();
  }, [router, setIsLoading, setEventsData]);
  return { error }
}