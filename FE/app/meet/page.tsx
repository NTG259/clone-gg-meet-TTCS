"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePreJoinForm } from "./hooks/use-prejoin-form";
import { createRoom } from "@/lib/api";
import { MeetingEntryForm } from "../components/meeting/meeting-entry-form";

export default function MeetPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const initialMode = useMemo(
        () => (searchParams.get("action") === "create" ? "create" : "join"),
        [searchParams]
    );

    const { mode, setMode, roomName, setRoomName } = usePreJoinForm(initialMode);

    async function handleContinue() {
        try {
            if (mode === "create") {
                setLoading(true);
                const data = await createRoom();
                router.push(`/meet/${data.roomName}/prejoin?mode=create`);
                return;
            }

            if (!roomName.trim()) return;
            router.push(`/meet/${roomName.trim()}/prejoin?mode=join`);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-semibold mb-6">Bắt đầu cuộc họp</h1>

            <MeetingEntryForm
                mode={mode}
                roomName={roomName}
                onModeChange={setMode}
                onRoomNameChange={setRoomName}
                onContinue={handleContinue}
                loading={loading}
            />
        </main>
    );
}