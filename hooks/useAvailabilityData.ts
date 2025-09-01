import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
type AvailabilitySlot = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	isGcal: boolean;
	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;
}
type AvailabilityData = {
    id:string;
    created_at:Date;
    availability:AvailabilitySlot[];
    eventID:string;
}
export default function useAvailabilityData(userID:string|undefined, organizerID:string|undefined, eventID:string|undefined){
    const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]|null>(null);
    useEffect(() => {
        const getParticipantAvailability = async () => {
            // If there's no userID, this user shouldn't be able to see others availability
            if (!userID) {
                return 
            }
            
            // If the current user is not the organizer, then they shouldn't be able to see others availability
            if (userID != organizerID) {
                return
            }

            const supabase = createClient();
			try {
				const { error: availabilityError, data: availabilityResponse } = await supabase
					.from("participant_availability")
					.select("*")
					.eq("event_id", eventID);
                console.log("availability Response", availabilityResponse)
				if (availabilityError) {
					throw availabilityError;
				}
                setAvailabilityData(availabilityResponse); 

			} catch (error) {
				console.error(error)
			}
		};
        getParticipantAvailability();
    }, [eventID, organizerID, userID])
    return availabilityData
}