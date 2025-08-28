import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type UserInfo = {
    name: string;
    email: string;
    availableSlots: any[];
}
type AvailabilitySlot = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	isGcal:boolean;
	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;
}

type Props = {
    setShowPopUp: React.Dispatch<React.SetStateAction<boolean>> ;
    availableSlots: AvailabilitySlot[]; // Change from userInfo to availableSlots
}

export default function  SubmitAvailabilityPopup({ setShowPopUp, availableSlots }:Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Implicitly uses onSubmit
    const uploadAvailability = async (name: string, email: string, availableSlots: AvailabilitySlot[]) => {
		console.log("User submitted info:", { name, email, availableSlots });
		try {
			// Create client-side Supabase instance
			const supabase = createClient();

			// Insert participant
			const { error: participantsError, data: participantData } = await supabase
				.from("participants")
				.insert({ name: name, email: email })
				.select("id") // Get the ID in the same query
				.single();

			if (participantsError) {
				console.error("Error inserting participant:", participantsError);
				alert("Failed to submit. Please try again.");
				return;
			}
			console.log("participant id", participantData.id);
			// Insert availability using the returned ID
			const { error: participantAvailabilityError } = await supabase
				.from("participant_availability")
				.insert({
					user_id: participantData.id, // Use the returned ID directly
					availability: availableSlots,
				});

			if (participantAvailabilityError) {
				console.error("Error inserting availability:", participantAvailabilityError);
				alert("Failed to submit availability. Please try again.");
				return;
			}

			setShowPopUp(false);
			alert(`Thank you ${name}! Your availability has been submitted.`);
		} catch (error) {
			console.log(error);
			console.error("Unexpected error:", error);
			alert("An unexpected error occurred. Please try again.");
		}
	};

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: { name?: string; email?: string, availableSlots?:string } = {};
        
        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!availableSlots) {
            newErrors.availableSlots = "Error: No availability selected"
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Sanitize inputs
		const sanitizedName = name.trim();
		const sanitizedEmail = email.trim().toLowerCase();

        // Update availability slots with user info
        const updatedSlots = availableSlots.map(slot => ({
            ...slot,
            title: `Available: ${sanitizedName} (${sanitizedEmail})` // Set title to name and email
        }));
        
        // Clear form and submit
        uploadAvailability(sanitizedName, sanitizedEmail, updatedSlots);
        setName('');
        setEmail('');
        setErrors({});
    };

    const handleCancel = () => {
        setName('');
        setEmail('');
        setErrors({});
		setShowPopUp(false);
    };

    return (
        <div className="popup-overlay" onClick={handleCancel}>
            <div className="popup-container" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h2>Submit Your Availability</h2>
                    <button className="close-button" onClick={handleCancel}>
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="popup-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={errors.name ? 'error' : ''}
                            placeholder="Enter your full name"
                            autoFocus
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={errors.email ? 'error' : ''}
                            placeholder="Enter your email address"
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="popup-actions">
                        <button type="button" className="cancel-button" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};