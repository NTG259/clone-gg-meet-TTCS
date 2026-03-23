"use client";

import { useState } from "react";
import { MeetingMode } from "@/types/meeting";

export function usePreJoinForm(initialMode: MeetingMode = "join") {
    const [mode, setMode] = useState<MeetingMode>(initialMode);
    const [roomName, setRoomName] = useState("");

    return {
        mode,
        setMode,
        roomName,
        setRoomName,
    };
}