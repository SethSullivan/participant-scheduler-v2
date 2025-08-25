'use client'
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import CreateEvent from "@/components/CreateEvent";

export default function DashBoard() {
    const [showPopup, setShowPopup] = useState(false)
	return (
		<div className="flex min-h-screen justify-center items-center border-2 border-solid">
			<div className="flex justify-center items-center">
			{showPopup 
                ? <CreateEvent/> 
                : <Button onClick={() => setShowPopup(true)}>Create Event</Button>
                }
			</div>
		</div>
	);
}
