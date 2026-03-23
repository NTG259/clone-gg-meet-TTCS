package com.meet.BE.controller;
import com.meet.BE.domain.request.CreateRoomRequest;
import com.meet.BE.domain.request.JoinRoomRequest;
import com.meet.BE.domain.response.RoomConnectionResponse;
import com.meet.BE.service.MeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/livekit")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping("/create-room")
    public ResponseEntity<?> createRoom(@RequestBody CreateRoomRequest request) {
        try {
            if (isBlank(request.getRoomName()) || isBlank(request.getParticipantName())) {
                return ResponseEntity.badRequest().body("roomName và participantName là bắt buộc");
            }

            RoomConnectionResponse response = meetingService.createRoomAndToken(
                    request.getRoomName().trim(),
                    request.getParticipantName().trim()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/join-room")
    public ResponseEntity<?> joinRoom(@RequestBody JoinRoomRequest request) {
        try {
            if (isBlank(request.getRoomName()) || isBlank(request.getParticipantName())) {
                return ResponseEntity.badRequest().body("roomName và participantName là bắt buộc");
            }

            RoomConnectionResponse response = meetingService.joinRoom(
                    request.getRoomName().trim(),
                    request.getParticipantName().trim()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}

