import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserInfo = {
	name: string;
	email: string;
	availableSlots: any[];
};
type AvailabilitySlot = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	isGcal: boolean;
	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;
};

type Props = {
	setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
	availableSlots: AvailabilitySlot[]; // Change from userInfo to availableSlots
    eventID:string;
};

export default function SubmitAvailabilityPopup({ setShowPopUp, availableSlots, eventID }: Props) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Implicitly uses onSubmit
	const uploadAvailability = async (
		name: string,
		email: string,
		availableSlots: AvailabilitySlot[]
	) => {
		console.log("User submitted info:", { name, email, availableSlots });
		try {
			// Create client-side Supabase instance
			const supabase = createClient();

			// Insert participant
			const { error: participantsError, data: participantData } = await supabase
				.from("participants")
				.upsert(
					{ name: name, email: email },
					{ onConflict: "email" }
				)
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
				.upsert({
					user_id: participantData.id, 
					availability: availableSlots,
                    eventID:eventID,
				}, 
				{onConflict: "user_id" } 
			);

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

		const newErrors: { name?: string; email?: string; availableSlots?: string } = {};

		if (!name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!validateEmail(email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!availableSlots) {
			newErrors.availableSlots = "Error: No availability selected";
		}
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Sanitize inputs
		const sanitizedName = name.trim();
		const sanitizedEmail = email.trim().toLowerCase();

		// Update availability slots with user info
		const updatedSlots = availableSlots.map((slot) => ({
			...slot,
			title: `Available: ${sanitizedName} (${sanitizedEmail})`, // Set title to name and email
		}));

		// Clear form and submit
		uploadAvailability(sanitizedName, sanitizedEmail, updatedSlots);
		setName("");
		setEmail("");
		setErrors({});
	};

	const handleCancel = () => {
		setName("");
		setEmail("");
		setErrors({});
		setShowPopUp(false);
	};

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
			onClick={handleCancel}
		>
			<div
				className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">
						Submit Your Availability
					</h2>
					<button
						className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
						onClick={handleCancel}
						type="button"
					>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div className="space-y-2">
						<label htmlFor="name" className="block text-sm font-medium text-gray-700">
							Full Name
						</label>
						<input
							type="text"
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
								errors.name
									? "border-red-300 focus:ring-red-500 focus:border-red-500"
									: "border-gray-300"
							}`}
							placeholder="Enter your full name"
							autoFocus
						/>
						{errors.name && <span className="text-sm text-red-600">{errors.name}</span>}
					</div>

					<div className="space-y-2">
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">
							Email Address
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
								errors.email
									? "border-red-300 focus:ring-red-500 focus:border-red-500"
									: "border-gray-300"
							}`}
							placeholder="Enter your email address"
						/>
						{errors.email && (
							<span className="text-sm text-red-600">{errors.email}</span>
						)}
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="button"
							className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
							onClick={handleCancel}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
						>
							Submit
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
