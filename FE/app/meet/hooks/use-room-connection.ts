"use client";

import { RefObject, useEffect, useRef, useState } from "react";
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

import { PreJoinConfig } from "@/types/meeting";
import { joinRoom } from "@/lib/api";

type UseRoomConnectionParams = {
    config: PreJoinConfig | null;
    localContainerRef: RefObject<HTMLDivElement | null>;
    remoteContainerRef: RefObject<HTMLDivElement | null>;
};

export function useRoomConnection({
    config,
    localContainerRef,
    remoteContainerRef,
}: UseRoomConnectionParams) {
    const roomRef = useRef<Room | null>(null);
    const [status, setStatus] = useState("Đang chuẩn bị...");

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

    async function connect() {
        if (!config) throw new Error("Thiếu cấu hình prejoin");

        const data = await joinRoom(config.roomName, config.displayName);

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
                    _publication: RemoteTrackPublication,
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

        setStatus(`Đã vào phòng ${data.roomName}`);
    }

    function disconnect() {
        roomRef.current?.disconnect();
        roomRef.current = null;
        clearContainers();
    }

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    return {
        status,
        connect,
        disconnect,
    };
}