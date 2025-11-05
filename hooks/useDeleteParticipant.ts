import { createClient } from "@/lib/supabase/client";
export default async function useDeleteParticipant(
  participantID: string
) {
  const supabase = createClient();
  try {
    console.log("Deleting participant with ID:", participantID);
    const { data, error } = await supabase
      .from("participants")
      .delete()
      .eq("id", participantID)
      .select();
    if (error) throw error;
    console.log("Participant deleted successfully:", data);
  } catch (error) {
    console.error("Error deleting participant:", error);
  }
}
