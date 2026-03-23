"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { savePreJoinConfig } from "@/lib/meeting-storage";

type SessionUser = {
    name: string;
} | null;

export default function PreJoinPage() {
    const router = useRouter();
    const params = useParams<{ roomName: string }>();
    const searchParams = useSearchParams();

    const roomName = params.roomName;
    const mode = useMemo(
        () => (searchParams.get("mode") === "create" ? "create" : "join"),
        [searchParams]
    );

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [camEnabled, setCamEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");

    // Thay bằng session/auth thật của bạn
    const sessionUser: SessionUser = null;

    const finalName = sessionUser?.name ?? displayName;
    const mustEnterName = !sessionUser?.name;

    useEffect(() => {
        let cancelled = false;

        async function setupPreview() {
            setError("");

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }

            if (!camEnabled && !micEnabled) {
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: camEnabled,
                    audio: micEnabled,
                });

                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    if (camEnabled) {
                        const videoOnlyStream = new MediaStream(stream.getVideoTracks());
                        videoRef.current.srcObject = videoOnlyStream;
                    } else {
                        videoRef.current.srcObject = null;
                    }
                }
            } catch {
                setError("Không truy cập được camera hoặc microphone.");
            }
        }

        setupPreview();

        return () => {
            cancelled = true;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };
    }, [camEnabled, micEnabled]);

    function handleContinue() {
        const name = finalName.trim();

        if (!name) {
            setError("Bạn cần nhập tên trước khi vào phòng.");
            return;
        }

        savePreJoinConfig({
            roomName,
            displayName: name,
            mode,
            camEnabled,
            micEnabled,
        });

        router.push(`/meet/${roomName}`);
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-semibold mb-2">Sẵn sàng tham gia?</h1>
            <p className="text-muted-foreground mb-6">
                Phòng: <strong>{roomName}</strong>
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                <section className="rounded-2xl border p-4">
                    <div className="aspect-video w-full rounded-xl bg-black/90 overflow-hidden flex items-center justify-center">
                        {camEnabled ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-white/80">Camera đang tắt</div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button
                            variant={camEnabled ? "default" : "outline"}
                            onClick={() => setCamEnabled((v) => !v)}
                        >
                            {camEnabled ? "Tắt camera" : "Bật camera"}
                        </Button>

                        <Button
                            variant={micEnabled ? "default" : "outline"}
                            onClick={() => setMicEnabled((v) => !v)}
                        >
                            {micEnabled ? "Tắt mic" : "Bật mic"}
                        </Button>
                    </div>
                </section>

                <section className="rounded-2xl border p-6 space-y-4">
                    {mustEnterName ? (
                        <label className="block">
                            <span className="text-sm text-muted-foreground">Tên hiển thị</span>
                            <input
                                className="mt-2 w-full rounded-xl border px-4 py-3 bg-background"
                                placeholder="Nhập tên của bạn"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </label>
                    ) : (
                        <div className="rounded-xl border px-4 py-3">
                            {/* Tên hiển thị: <strong>{sessionUser.name}</strong> */}
                        </div>
                    )}

                    <div className="rounded-xl border px-4 py-3 text-sm text-muted-foreground">
                        {mode === "create"
                            ? "Bạn sẽ tạo phòng và vào ngay sau bước này."
                            : "Bạn sẽ gửi yêu cầu tham gia phòng sau bước này."}
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button onClick={handleContinue} className="w-full">
                        {mode === "create" ? "Tạo và vào phòng" : "Yêu cầu vào phòng"}
                    </Button>
                </section>
            </div>
        </main>
    );
}