import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EventsData } from "@/types/types";
import { useRouter } from "next/navigation";

export default function useUsersEvents() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [eventsData, setEventsData] = useState<EventsData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
          .eq("organizer_id", user.sub);

        if (eventsError) throw eventsError;

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
  }, [router]);
  return { eventsData, isLoading, error, setEventsData };
}
