import React, { useEffect, useState } from "react";
import { CalendarSlot } from "@/types/types";

type Props = {
  setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  availableSlots: CalendarSlot[]; // Change from userInfo to availableSlots
  eventID: string;
};

export default function SubmitAvailabilityPopup({
  setShowPopUp,
  availableSlots,
  eventID,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // On component mount, check localStorage for name and email
  useEffect(() => {
    const setNameAndEmailFromLocal = () => {
      const localAvailability = localStorage.getItem(`availability-${eventID}`);
      if (localAvailability) {
        const localAvailabilityInfo = JSON.parse(localAvailability);
        setName(localAvailabilityInfo.name ?? "");
        setEmail(localAvailabilityInfo.email ?? "");
      }
    };
    setNameAndEmailFromLocal();
  }, [eventID]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const uploadAvailability = async (
    name: string,
    email: string,
    availableSlots: CalendarSlot[]
  ) => {
    console.log("User submitted info:", { name, email, availableSlots });
    try {
      const response = await fetch("/api/submit-availability", {
        method: "POST",
        body: JSON.stringify({ name, email, availableSlots, eventID }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit");
      }

      setShowPopUp(false);
      alert(`Thank you ${name}! Your availability has been submitted.`);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    const newErrors: {
      name?: string;
      email?: string;
      availableSlots?: string;
    } = {};

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
      setIsLoading(false);
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

    // Save to localStorage, this will overwrite previous data when user comes back to make changes
    localStorage.setItem(
      `availability-${eventID}`,
      JSON.stringify({
        name: sanitizedName,
        email: sanitizedEmail,
        calendCalendarSlots: updatedSlots,
      })
    );

    // Clear form and submit
    await uploadAvailability(sanitizedName, sanitizedEmail, updatedSlots);
    setName("");
    setEmail("");
    setErrors({});
    setIsLoading(false);
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
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
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
            {errors.name && (
              <span className="text-sm text-red-600">{errors.name}</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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
              disabled={isLoading}
              className={`flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                isLoading
                  ? "bg-blue-400 opacity-60 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
