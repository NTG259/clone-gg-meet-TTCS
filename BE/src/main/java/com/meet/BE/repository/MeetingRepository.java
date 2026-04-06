package com.meet.BE.repository;

<<<<<<< HEAD
import com.meet.BE.domain.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
=======
import com.meet.BE.domain.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Room, String> {
    Optional<Object> findByRoomCode(String roomCode);
>>>>>>> 1c0cecc4a4d24a2fc3e300000e10de8ab9e87937
}
