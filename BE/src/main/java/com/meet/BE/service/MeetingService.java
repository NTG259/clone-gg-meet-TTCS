package com.meet.BE.service;

import com.meet.BE.domain.response.RoomConnectionResponse;
import com.meet.BE.repository.MeetingRepository;
import com.meet.BE.utils.GenerateRoomCode;
import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.RoomServiceClient;
import livekit.LivekitModels;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import retrofit2.Response;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MeetingService {

    @Value("${livekit.api-key}")
    private String apiKey;

    @Value("${livekit.api-secret}")
    private String apiSecret;

    @Value("${livekit.host}")
    private String livekitHost;

    @Value("${livekit.ws-url}")
    private String livekitWsUrl;

    private final MeetingRepository meetingRepository;

    private RoomServiceClient roomServiceClient() {
        return RoomServiceClient.createClient(livekitHost, apiKey, apiSecret);
    }

    public RoomConnectionResponse createRoomAndToken(String roomName, String participantName) throws IOException {
        String roomCode = GenerateRoomCode.generateCode();

        Response<LivekitModels.Room> response = roomServiceClient().createRoom(roomCode).execute();

        if (!response.isSuccessful()) {
            String errorBody = response.errorBody() != null ? response.errorBody().string() : "unknown error";
            throw new IllegalStateException("Không tạo được room: " + errorBody);
        }

        String token = createParticipantToken(roomCode, participantName);

        
        return new RoomConnectionResponse(
                roomCode,
                participantName,
                token,
                livekitWsUrl
        );
    }

    public RoomConnectionResponse joinRoom(String roomName, String participantName) {
        String token = createParticipantToken(roomName, participantName);

        return new RoomConnectionResponse(
                roomName,
                participantName,
                token,
                livekitWsUrl
        );
    }

    private String createParticipantToken(String roomName, String participantName) {
        String identity = participantName + "-" + UUID.randomUUID().toString().substring(0, 8);

        AccessToken token = new AccessToken(apiKey, apiSecret);
        token.setName(participantName);
        token.setIdentity(identity);

        // token hết hạn sau 2 giờ
        token.setTtl(TimeUnit.HOURS.toMillis(2));

        token.addGrants(
                new RoomJoin(true),
                new RoomName(roomName)
        );

        return token.toJwt();
    }
}