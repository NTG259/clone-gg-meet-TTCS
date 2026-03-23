package com.meet.BE.repository;

import com.meet.BE.domain.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Room, Long> {
    Optional<Object> findByRoomCode(String roomCode);
}
