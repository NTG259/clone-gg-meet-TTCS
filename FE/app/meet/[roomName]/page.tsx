"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    LocalTrackPublication,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
    Track,
    VideoPresets,
} from "livekit-client";
import { clearPreJoinConfig, getPreJoinConfig } from "@/lib/meeting-storage";


type ConnectionResponse = {
    roomName: string;
    participantName: string;
    token: string;
    wsUrl: string;
};

export default function RoomPage() {
    const params = useParams<{ roomName: string }>();
    const router = useRouter();
    const roomName = params.roomName;

    const roomRef = useRef<Room | null>(null);
    const localContainerRef = useRef<HTMLDivElement | null>(null);
    const remoteContainerRef = useRef<HTMLDivElement | null>(null);

    const [status, setStatus] = useState("Đang chuẩn bị...");

    useEffect(() => {
        let mounted = true;

        function clearContainers() {
            if (localContainerRef.current) localContainerRef.current.innerHTML = "";
            if (remoteContainerRef.current) remoteContainerRef.current.innerHTML = "";
        }

        function getOrCreateRemoteBox(identity: string) {
            const parent = remoteContainerRef.current;
            if (!parent) return null;

            let box = parent.querySelector<HTMLDivElement>(`[data-id="${identity}"]`);
            if (box) return box;

            box = document.createElement("div");
            box.setAttribute("data-id", identity);
            box.className = "rounded-xl border p-3 space-y-2";

            const title = document.createElement("div");
            title.innerText = identity;
            title.className = "text-sm font-medium";

            box.appendChild(title);
            parent.appendChild(box);
            return box;
        }

        async function start() {
            const config = getPreJoinConfig();

            if (!config || config.roomName !== roomName) {
                router.replace(`/meet/${roomName}/prejoin?mode=join`);
                return;
            }

            const endpoint =
                config.mode === "create"
                    ? "http://localhost:8080/api/livekit/create-room"
                    : "http://localhost:8080/api/livekit/join-room";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roomName: config.roomName,
                    participantName: config.displayName,
                }),
            });

            if (!res.ok) {
                const message = await res.text();
                throw new Error(message || "Không lấy được token");
            }

            const data: ConnectionResponse = await res.json();

            const room = new Room({
                adaptiveStream: true,
                dynacast: true,
                videoCaptureDefaults: {
                    resolution: VideoPresets.h720.resolution,
                },
            });

            roomRef.current = room;

            room
                .on(
                    RoomEvent.TrackSubscribed,
                    (
                        track: RemoteTrack,
                        publication: RemoteTrackPublication,
                        participant: RemoteParticipant
                    ) => {
                        const box = getOrCreateRemoteBox(participant.identity);
                        if (!box) return;

                        const el = track.attach();
                        if (track.kind === Track.Kind.Video) {
                            el.className = "w-full max-w-xl rounded-lg";
                        }
                        box.appendChild(el);
                    }
                )
                .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
                    const elements = track.detach();
                    elements.forEach((el) => el.remove());
                })
                .on(RoomEvent.LocalTrackUnpublished, (publication: LocalTrackPublication) => {
                    const elements = publication.track?.detach() ?? [];
                    elements.forEach((el) => el.remove());
                })
                .on(RoomEvent.Disconnected, () => {
                    if (!mounted) return;
                    setStatus("Đã ngắt kết nối");
                    clearContainers();
                });

            await room.connect(data.wsUrl, data.token);

            if (config.camEnabled) {
                await room.localParticipant.setCameraEnabled(true);
            }

            if (config.micEnabled) {
                await room.localParticipant.setMicrophoneEnabled(true);
            }

            const localVideoPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
            const localVideoTrack = localVideoPub?.track;

            if (localVideoTrack && localContainerRef.current) {
                const el = localVideoTrack.attach();
                el.className = "w-full max-w-xl rounded-lg";
                localContainerRef.current.appendChild(el);
            }

            if (mounted) {
                setStatus(`Đã vào phòng ${data.roomName}`);
            }
        }

        start().catch((err) => {
            console.error(err);
            setStatus(err instanceof Error ? err.message : "Có lỗi xảy ra");
        });

        return () => {
            mounted = false;
            roomRef.current?.disconnect();
            clearPreJoinConfig();
        };
    }, [roomName, router]);

    return (
        <main className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Phòng: {roomName}</h1>
                <p className="text-muted-foreground">{status}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <section className="rounded-2xl border p-4">
                    <h2 className="font-medium mb-3">Bạn</h2>
                    <div ref={localContainerRef} className="min-h-60 rounded-xl bg-muted p-2" />
                </section>

                <section className="rounded-2xl border p-4">
                    <h2 className="font-medium mb-3">Người tham gia khác</h2>
                    <div ref={remoteContainerRef} className="min-h-60 rounded-xl bg-muted p-2 space-y-3" />
                </section>
            </div>
        </main>
    );
}