"use client";

import { useEffect, useRef, useState } from "react";
import {
    LocalTrackPublication,
    Participant,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
    Track,
    VideoPresets,
} from "livekit-client";

type ConnectionResponse = {
    roomName: string;
    participantName: string;
    token: string;
    wsUrl: string;
};

export default function HomePage() {
    const [participantName, setParticipantName] = useState("");
    const [roomName, setRoomName] = useState("");
    const [status, setStatus] = useState("Chưa kết nối");
    const [error, setError] = useState("");
    const [connectedRoom, setConnectedRoom] = useState("");
    const [needStartAudio, setNeedStartAudio] = useState(false);

    const roomRef = useRef<Room | null>(null);
    const localContainerRef = useRef<HTMLDivElement | null>(null);
    const remoteContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        return () => {
            roomRef.current?.disconnect();
        };
    }, []);

    function clearMediaContainers() {
        if (localContainerRef.current) {
            localContainerRef.current.innerHTML = "";
        }
        if (remoteContainerRef.current) {
            remoteContainerRef.current.innerHTML = "";
        }
    }

    function getOrCreateParticipantBox(identity: string) {
        const parent = remoteContainerRef.current;
        if (!parent) return null;

        let box = parent.querySelector<HTMLDivElement>(`[data-participant="${identity}"]`);
        if (box) return box;

        box = document.createElement("div");
        box.setAttribute("data-participant", identity);
        box.style.border = "1px solid #ddd";
        box.style.borderRadius = "12px";
        box.style.padding = "8px";
        box.style.background = "#fafafa";
        box.style.display = "flex";
        box.style.flexDirection = "column";
        box.style.gap = "8px";

        const title = document.createElement("div");
        title.innerText = identity;
        title.style.fontWeight = "600";
        title.style.fontSize = "14px";

        box.appendChild(title);
        parent.appendChild(box);
        return box;
    }

    function attachRemoteTrack(
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
    ) {
        const box = getOrCreateParticipantBox(participant.identity);
        if (!box) return;

        const element = track.attach();

        if (track.kind === Track.Kind.Video) {
            element.style.width = "100%";
            element.style.maxWidth = "420px";
            element.style.borderRadius = "10px";
        }

        if (track.kind === Track.Kind.Audio) {
            element.controls = true;
        }

        box.appendChild(element);
    }

    function detachTrack(track: RemoteTrack) {
        const elements = track.detach();
        elements.forEach((el) => el.remove());
    }

    async function connectWithResponse(data: ConnectionResponse) {
        setError("");
        setStatus("Đang kết nối...");

        roomRef.current?.disconnect();
        clearMediaContainers();

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
                    attachRemoteTrack(track, publication, participant);
                }
            )
            .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
                detachTrack(track);
            })
            .on(
                RoomEvent.LocalTrackUnpublished,
                (publication: LocalTrackPublication) => {
                    const elements = publication.track?.detach() ?? [];
                    elements.forEach((el) => el.remove());
                }
            )
            .on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
                console.log("Active speakers:", speakers.map((s) => s.identity));
            })
            .on(RoomEvent.AudioPlaybackStatusChanged, () => {
                setNeedStartAudio(!room.canPlaybackAudio);
            })
            .on(RoomEvent.Disconnected, () => {
                setStatus("Đã ngắt kết nối");
                setConnectedRoom("");
                setNeedStartAudio(false);
                clearMediaContainers();
            });

        room.prepareConnection(data.wsUrl, data.token);

        await room.connect(data.wsUrl, data.token);

        // bật camera + mic
        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);

        // render local camera
        const cameraPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
        const localTrack = cameraPublication?.track;

        if (localTrack && localContainerRef.current) {
            const el = localTrack.attach();
            el.style.width = "100%";
            el.style.maxWidth = "420px";
            el.style.borderRadius = "10px";
            localContainerRef.current.appendChild(el);
        }

        setConnectedRoom(data.roomName);
        setStatus(`Đã kết nối phòng: ${data.roomName}`);
    }

    async function createRoom() {
        try {


            const res = await fetch("http://100.69.214.28:8080/api/livekit/create-room", {
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
                throw new Error(message || "Không tạo được phòng");
            }

            const data: ConnectionResponse = await res.json();
            await connectWithResponse(data);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
            setStatus("Lỗi");
        }
    }

    async function joinRoom() {
        try {
            if (!participantName.trim() || !roomName.trim()) {
                setError("Bạn phải nhập tên và tên phòng");
                return;
            }

            const res = await fetch("http://100.69.214.28:8080/api/livekit/join-room", {
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
                throw new Error(message || "Không join được phòng");
            }

            const data: ConnectionResponse = await res.json();
            await connectWithResponse(data);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
            setStatus("Lỗi");
        }
    }

    async function leaveRoom() {
        roomRef.current?.disconnect();
        roomRef.current = null;
        clearMediaContainers();
        setStatus("Đã rời phòng");
        setConnectedRoom("");
        setNeedStartAudio(false);
    }

    async function startAudio() {
        try {
            if (roomRef.current) {
                await roomRef.current.startAudio();
                setNeedStartAudio(false);
            }
        } catch (err) {
            console.error(err);
            setError("Không bật được audio");
        }
    }

    return (
        <main
            style={{
                maxWidth: 1000,
                margin: "0 auto",
                padding: 24,
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h1>LiveKit Demo - Tạo phòng và Join phòng</h1>

            <div
                style={{
                    display: "grid",
                    gap: 12,
                    marginBottom: 20,
                    maxWidth: 420,
                }}
            >
                <input
                    placeholder="Tên của bạn"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
                />

                <input
                    placeholder="Tên phòng, ví dụ: demo-123"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
                />

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                        onClick={createRoom}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Tạo phòng
                    </button>

                    <button
                        onClick={joinRoom}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Join phòng
                    </button>

                    <button
                        onClick={leaveRoom}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Rời phòng
                    </button>

                    {needStartAudio && (
                        <button
                            onClick={startAudio}
                            style={{
                                padding: "10px 14px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Bật âm thanh
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: 12 }}>
                <strong>Trạng thái:</strong> {status}
            </div>

            {connectedRoom && (
                <div style={{ marginBottom: 12 }}>
                    <strong>Room hiện tại:</strong> {connectedRoom}
                </div>
            )}

            {error && (
                <div style={{ color: "red", marginBottom: 16 }}>
                    <strong>Lỗi:</strong> {error}
                </div>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                <section>
                    <h2>Local</h2>
                    <div
                        ref={localContainerRef}
                        style={{
                            minHeight: 240,
                            border: "1px solid #ddd",
                            borderRadius: 12,
                            padding: 12,
                            background: "#f9f9f9",
                        }}
                    />
                </section>

                <section>
                    <h2>Remote</h2>
                    <div
                        ref={remoteContainerRef}
                        style={{
                            minHeight: 240,
                            border: "1px solid #ddd",
                            borderRadius: 12,
                            padding: 12,
                            background: "#f9f9f9",
                            display: "grid",
                            gap: 12,
                        }}
                    />
                </section>
            </div>
        </main>
    );
}