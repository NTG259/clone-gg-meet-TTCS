import {
    ConnectionResponse,
    CreateRoomResponse,
} from "@/types/meeting";

const BACKEND_URL = "http://localhost:8080";

export async function createRoom(): Promise<CreateRoomResponse> {
    const res = await fetch(`${BACKEND_URL}/api/livekit/create-room`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Không tạo được phòng");
    }

    return res.json();
}

export async function joinRoom(
    roomName: string,
    participantName: string
): Promise<ConnectionResponse> {
    const res = await fetch(`${BACKEND_URL}/api/livekit/join-room`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            roomName,
            participantName,
        }),
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Không vào được phòng");
    }

    return res.json();
}