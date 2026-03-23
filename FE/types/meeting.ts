export type MeetingMode = "create" | "join";

export type PreJoinConfig = {
    roomName: string;
    displayName: string;
    mode: MeetingMode;
    camEnabled: boolean;
    micEnabled: boolean;
};

export type CreateRoomResponse = {
    roomName: string;
};

export type ConnectionResponse = {
    roomName: string;
    participantName: string;
    token: string;
    wsUrl: string;
};