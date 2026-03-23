package com.meet.BE.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "meetings")
public class Meeting {

    // ===== Getter Setter =====
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên phòng (trùng với LiveKit room)
    @Column(nullable = false)
    private String roomName;

    // ID từ LiveKit (SID)
    @Column(unique = true)
    private String roomSid;

    // Người tạo (có thể map với User sau)
    private String createdBy;

    // Thời gian tạo
    private LocalDateTime createdAt;

    // Thời gian bắt đầu thực tế
    private LocalDateTime startedAt;

    // Thời gian kết thúc
    private LocalDateTime endedAt;

    // metadata (optional)
    @Column(columnDefinition = "TEXT")
    private String metadata;
}