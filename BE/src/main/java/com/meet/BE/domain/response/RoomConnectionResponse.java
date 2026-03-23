package com.meet.BE.domain.response;

public class RoomConnectionResponse {
    private String roomName;
    private String participantName;
    private String token;
    private String wsUrl;

    public RoomConnectionResponse() {
    }

    public RoomConnectionResponse(String roomName, String participantName, String token, String wsUrl) {
        this.roomName = roomName;
        this.participantName = participantName;
        this.token = token;
        this.wsUrl = wsUrl;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getWsUrl() {
        return wsUrl;
    }

    public void setWsUrl(String wsUrl) {
        this.wsUrl = wsUrl;
    }
}
