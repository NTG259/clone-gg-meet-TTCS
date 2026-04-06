package com.meet.BE.controller;

import com.meet.BE.domain.ApiResponse;
import com.meet.BE.domain.entity.User;
import com.meet.BE.domain.request.GoogleLoginRequest;
import com.meet.BE.domain.response.AuthResponse;
import com.meet.BE.service.GoogleAuthService;
import com.meet.BE.service.SecurityService;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final SecurityService securityService;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        User user = googleAuthService.verifyGoogleToken(request.getCredential());
        
        String appToken = securityService.generateToken(user.getEmail());
        
        return ResponseEntity.ok(new AuthResponse(appToken, user));
    }
}
