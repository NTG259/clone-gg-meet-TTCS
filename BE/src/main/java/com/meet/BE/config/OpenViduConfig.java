package com.meet.BE.config;

import io.openvidu.java.client.OpenVidu;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenViduConfig {

    @Value("${openvidu.url}")
    private String url;

    @Value("${openvidu.secret}")
    private String secret;

    @Bean
    public OpenVidu openVidu() {
        return new OpenVidu(url, secret);
    }
}