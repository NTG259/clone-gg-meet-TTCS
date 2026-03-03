"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Grid3x3, Hand, Maximize2, MessageSquare, Mic, MonitorUp, MoreVertical, Phone, Settings, Users, Video } from "lucide-react";
import { OpenVidu } from "openvidu-browser";
import { useRef, useState } from "react";

export default function MeetingPage() {

    const [joined, setJoined] = useState(false);

    // State lưu danh sách những người khác trong phòng (remote users)
    const [subscribers, setSubscribers] = useState<any[]>([]);

    // Dùng useRef để giữ session không bị mất khi React re-render
    const sessionRef = useRef<any>(null);

    const handleJoinCamera = async () => {
        if (joined) return;

        // 1. CHỈ khởi tạo OpenVidu khi người dùng thực sự bấm nút (Tránh lỗi Next.js SSR)
        const OV = new OpenVidu();
        const session = OV.initSession();
        sessionRef.current = session;

        const roomName = "test";

        // 2. Lắng nghe người khác Join
        session.on("streamCreated", (event: any) => {
            // Báo cho OpenVidu biết: "Đừng tạo HTML gì cả, đưa data đây React tự lo" (truyền undefined)
            const subscriber = session.subscribe(event.stream, undefined);

            // Thêm người mới vào mảng State
            setSubscribers((prev) => [...prev, subscriber]);
        });

        // 3. Lắng nghe người khác Thoát
        session.on("streamDestroyed", (event: any) => {
            // Xóa người đó khỏi mảng State
            setSubscribers((prev) =>
                prev.filter((sub) => sub.stream.streamId !== event.stream.streamId)
            );
        });

        try {
            // 4. Lấy Token từ Server của bạn
            await fetch(`http://100.90.25.32:8080/api/sessions/${roomName}`, { method: "POST" });
            const tokenResponse = await fetch(`http://100.90.25.32:8080/api/sessions/${roomName}/connections`, { method: "POST" });
            const token = await tokenResponse.text();

            // 5. Kết nối vào phòng
            await session.connect(token);

            // 6. Truyền Cam/Mic của bản thân đi (Ẩn cam trên máy mình bằng cách truyền undefined)
            const publisher = await OV.initPublisherAsync(undefined, {
                publishAudio: true,
                publishVideo: true,
            });

            session.publish(publisher);
            setJoined(true);

        } catch (error) {
            console.error("Lỗi khi join phòng:", error);
        }
    };

    return (
        <>
            <div className="h-screen bg-background flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-sm font-medium"></span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Meeting ID:</span>
                            <span className="text-sm font-mono"></span>
                            <button

                                className="text-primary hover:text-primary/80 transition-colors"
                            >
                                {/* {copied ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )} */}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button

                            size="sm"

                        >
                            <Grid3x3 className="w-4 h-4" />
                        </Button>
                        <Button

                            size="sm"

                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="p-5">
                        <h2>OpenVidu Test</h2>

                        <button
                            className="bg-red-500 text-white rounded-2xl hover:bg-red-400 p-2 mt-4"
                            onClick={handleJoinCamera}
                            disabled={joined}
                        >
                            {joined ? "Đã vào phòng" : "Join with Camera"}
                        </button>

                        <hr className="my-5" />

                        {/* KHU VỰC HIỂN THỊ CAM ĐỐI PHƯƠNG */}
                        <div id="videos" className="flex gap-4 mt-10">
                            {subscribers.map((sub, index) => (
                                <VideoComponent key={sub.stream.streamId} streamManager={sub} />
                            ))}
                        </div>
                    </div>

                </div>
                {/* Main Content */}
                {/* <div className="flex-1 flex overflow-hidden">
                    {/* Video Grid */}
                {/* <div className="flex-1 p-6 overflow-y-auto">
                        <div className={`grid gap-4 h-full ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr'
                                : 'grid-cols-1'
                            }`}>
                            {participants.map((participant) => (
                                <motion.div
                                    key={participant.id}
                                    layout
                                    className="relative group"
                                >
                                    <Card className="w-full h-full min-h-[280px] overflow-hidden bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center relative">
                                        {participant.isVideoOff ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold">
                                                    {participant.name.charAt(0)}
                                                </div>
                                                <p className="font-medium">{participant.name}</p>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold mx-auto mb-3">
                                                        {participant.name.charAt(0)}
                                                    </div>
                                                    <p className="font-medium">{participant.name}</p>
                                                    <p className="text-sm text-muted-foreground">Camera active</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Participant Info Overlay */}
                {/* <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-medium text-sm">
                                                        {participant.name}
                                                    </span>
                                                    {participant.isHost && (
                                                        <span className="px-2 py-0.5 bg-primary/80 text-white text-xs rounded">
                                                            Host
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {participant.isMuted ? (
                                                        <div className="w-6 h-6 rounded bg-red-500/90 flex items-center justify-center">
                                                            <MicOff className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    ) : participant.isSpeaking ? (
                                                        <div className="w-6 h-6 rounded bg-green-500/90 flex items-center justify-center">
                                                            <Mic className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div> */}

                {/* Hover Actions */}
                {/* <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 bg-black/40 hover:bg-black/60 text-white">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))} */}
                {/* </div>
                    </div> */}

                {/* Sidebar - Chat/Participants */}
                {/* <AnimatePresence>
                        {(showChat || showParticipants) && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 360, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-l border-border bg-card overflow-hidden"
                            >
                                <div className="h-full flex flex-col">
                                    <div className="p-4 border-b border-border flex gap-2">
                                        <Button
                                            variant={showParticipants ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => {
                                                setShowParticipants(true);
                                                setShowChat(false);
                                            }}
                                            className="flex-1"
                                        >
                                            <Users className="w-4 h-4" />
                                            Participants ({participants.length})
                                        </Button>
                                        <Button
                                            variant={showChat ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => {
                                                setShowChat(true);
                                                setShowParticipants(false);
                                            }}
                                            className="flex-1"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Chat
                                        </Button>
                                    </div>

                                    {showParticipants && (
                                        <div className="flex-1 overflow-y-auto p-4">
                                            <div className="space-y-2">
                                                {participants.map((participant) => (
                                                    <div
                                                        key={participant.id}
                                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                                                            {participant.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium truncate">{participant.name}</p>
                                                                {participant.isHost && (
                                                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                                                        Host
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {participant.isMuted ? (
                                                                <MicOff className="w-4 h-4 text-muted-foreground" />
                                                            ) : (
                                                                <Mic className="w-4 h-4 text-green-500" />
                                                            )}
                                                            {participant.isVideoOff && (
                                                                <VideoOff className="w-4 h-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {showChat && (
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                        S
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <span className="font-medium text-sm">Sarah Chen</span>
                                                            <span className="text-xs text-muted-foreground">9:45 AM</span>
                                                        </div>
                                                        <p className="text-sm bg-muted p-3 rounded-lg">
                                                            Great presentation! Looking forward to the next steps.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                        M
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <span className="font-medium text-sm">Mike Johnson</span>
                                                            <span className="text-xs text-muted-foreground">9:46 AM</span>
                                                        </div>
                                                        <p className="text-sm bg-muted p-3 rounded-lg">
                                                            Agreed! Can someone share the slides?
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border-t border-border">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Type a message..."
                                                        className="flex-1 px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                                    />
                                                    <Button>Send</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence> */}
                {/* </div> */}

                {/* Control Bar */}
                <div className="bg-card border-t border-border px-6 py-4">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground hidden md:block">
                                Team Standup
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button

                                className="w-12 h-12 p-0 rounded-full"
                            >
                                <Mic className="w-5 h-5" />
                            </Button>

                            <Button

                                className="w-12 h-12 p-0 rounded-full"
                            >
                                <Video className="w-5 h-5" />
                            </Button>

                            <Button

                                className="w-12 h-12 p-0 rounded-full"
                            >
                                <MonitorUp className="w-5 h-5" />
                            </Button>

                            <div className="w-px h-8 bg-border mx-2" />

                            <Button
                            // variant={showParticipants ? 'primary' : 'secondary'}
                            // onClick={() => {
                            //     setShowParticipants(!showParticipants);
                            //     setShowChat(false);
                            // }}
                            // className="w-12 h-12 p-0 rounded-full relative"
                            >
                                <Users className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">

                                </span>
                            </Button>

                            <Button
                                // variant={showChat ? 'primary' : 'secondary'}
                                // onClick={() => {
                                //     setShowChat(!showChat);
                                //     setShowParticipants(false);
                                // }}
                                className="w-12 h-12 p-0 rounded-full"
                            >
                                <MessageSquare className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="secondary"
                                className="w-12 h-12 p-0 rounded-full"
                            >
                                <Hand className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="secondary"
                                className="w-12 h-12 p-0 rounded-full"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </div>

                        <Button

                            className="px-6"
                        >
                            <Phone className="w-5 h-5" />
                            End call
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}